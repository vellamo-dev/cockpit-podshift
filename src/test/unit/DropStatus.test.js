/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Unit tests for DropStatus, the status helpers of the drop history.
 *
 * @file DropStatus.test.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import QUnit from 'qunit';

import {DropStatus} from '../../app/utils/DropStatus.js';

QUnit.module('DropStatus', () => {
    QUnit.test('kind maps every PodShift status to an icon kind', assert => {
        for (const status of ['accepted', 'validated', 'installing']) {
            assert.strictEqual(DropStatus.kind(status), 'progress', status);
        }
        assert.strictEqual(DropStatus.kind('installed'), 'installed');
        assert.strictEqual(DropStatus.kind('unchanged'), 'unchanged');
        for (const status of ['uploaded', 'removing', 'removed']) {
            assert.strictEqual(DropStatus.kind(status), 'failed', `${status} is no longer a PodShift status`);
        }
        assert.strictEqual(DropStatus.kind('failed'), 'failed');
        assert.strictEqual(DropStatus.kind('refused'), 'refused');
        assert.strictEqual(DropStatus.kind('something-new'), 'failed', 'an unknown status shows as failed');
        assert.strictEqual(DropStatus.kind(undefined), 'failed');
    });

    QUnit.test('needsPoll is true while any item is in progress', assert => {
        /**
         * Builds a history item with the given status.
         *
         * @param {string} status Item status.
         * @returns {object} A history item.
         */
        function item(status) { return {name: `${status}.container`, status, time: '2026-11-20T20:00:00Z'} }
        assert.true(DropStatus.needsPoll([item('installed'), item('installing')]));
        assert.true(DropStatus.needsPoll([item('accepted'), item('failed')]));
        assert.true(DropStatus.needsPoll([item('validated')]));
        assert.false(DropStatus.needsPoll([item('unchanged'), item('refused')]));
        assert.false(DropStatus.needsPoll([item('uploaded'), item('removing')]), 'old statuses do not keep polling');
        assert.false(DropStatus.needsPoll([item('installed'), item('failed'), item('refused')]));
        assert.false(DropStatus.needsPoll([]));
        assert.false(DropStatus.needsPoll(null));
        assert.false(DropStatus.needsPoll(undefined));
    });

    QUnit.test('stepDelay follows the monitoring steps of each card', assert => {
        const steps = DropStatus.MONITOR_STEPS;
        const cases = [
            [0, 1000, 1000], [14999, 1000, 1000],
            [15000, 2000, 5000], [29999, 2000, 5000],
            [30000, 3000, 10000], [119999, 3000, 10000],
            [120000, 5000, 15000], [239999, 5000, 15000], [600000, 5000, 15000]
        ];
        for (const [ms, history, log] of cases) {
            assert.strictEqual(DropStatus.stepDelay(steps, 'history', ms), history, `history at ${ms} ms`);
            assert.strictEqual(DropStatus.stepDelay(steps, 'log', ms), log, `log at ${ms} ms`);
        }
        assert.strictEqual(DropStatus.stepDelay(steps, 'history', NaN), 0, 'no start');
        assert.strictEqual(DropStatus.stepDelay(steps, 'log', -5), 0, 'a clock step back counts as no start');
    });

    QUnit.test('stepDelay follows the dropping steps, the same for both cards, and ends at 2 minutes', assert => {
        const steps = DropStatus.DROP_STEPS;
        const cases = [[0, 300], [14999, 300], [15000, 500], [29999, 500], [30000, 1000], [59999, 1000], [60000, 2000], [119999, 2000], [120000, 0]];
        for (const [ms, delay] of cases) {
            assert.strictEqual(DropStatus.stepDelay(steps, 'history', ms), delay, `history at ${ms} ms`);
            assert.strictEqual(DropStatus.stepDelay(steps, 'log', ms), delay, `log at ${ms} ms`);
        }
    });

    QUnit.test('pollDelay takes the faster of monitoring and dropping', assert => {
        assert.strictEqual(DropStatus.pollDelay('log', 200000, NaN, false), 15000, 'monitoring only');
        assert.strictEqual(DropStatus.pollDelay('log', 200000, 0, false), 300, 'right after a drop');
        assert.strictEqual(DropStatus.pollDelay('history', 0, 0, false), 300, 'a drop is faster than the first monitoring step');
        assert.strictEqual(DropStatus.pollDelay('history', 0, 60000, false), 1000, 'monitoring is faster than 2 s of dropping');
        assert.strictEqual(DropStatus.pollDelay('log', 0, 60000, false), 1000, 'the log too');
        assert.strictEqual(DropStatus.pollDelay('log', 40000, 60000, false), 2000, 'dropping is faster than 10 s of monitoring');
        assert.strictEqual(DropStatus.pollDelay('history', 200000, 120000, false), 5000, 'back to monitoring after 2 minutes of dropping');
        assert.strictEqual(DropStatus.pollDelay('log', NaN, NaN, false), 15000, 'without a start the slowest monitoring step applies');
    });

    QUnit.test('pollDelay polls at least every second while an item is in progress', assert => {
        assert.strictEqual(DropStatus.pollDelay('log', 200000, NaN, true), 1000, 'log');
        assert.strictEqual(DropStatus.pollDelay('history', 200000, NaN, true), 1000, 'history');
        assert.strictEqual(DropStatus.pollDelay('log', 20000, 90000, true), 1000, 'over 2 s of dropping and 5 s of monitoring');
        assert.strictEqual(DropStatus.pollDelay('log', 200000, 0, true), 300, 'a faster delay stays');
        assert.strictEqual(DropStatus.pollDelay('history', NaN, NaN, true), 1000, 'without a start');
    });

    QUnit.test('hasTerminalDrop is true for a new item the page did not upload', assert => {
        const time = '2026-11-23T20:00:00Z';
        const old = {id: 'id-old', name: 'web.container', status: 'installed', time};
        const mine = {id: 'id-mine', name: 'shop.zip', status: 'accepted', time};
        const other = {id: 'id-other', name: 'db.container', status: 'accepted', time};
        const seen = new Set(['id-old']);
        assert.false(DropStatus.hasTerminalDrop([old], seen, new Set()), 'nothing new');
        assert.true(DropStatus.hasTerminalDrop([old, other], seen, new Set()), 'a new item from a terminal');
        assert.false(DropStatus.hasTerminalDrop([old, mine], seen, new Set(['shop.zip'])), 'the page uploaded it');
        assert.true(DropStatus.hasTerminalDrop([old, mine, other], seen, new Set(['shop.zip'])), 'one of the page and one from a terminal');
        assert.true(DropStatus.hasTerminalDrop([mine], new Set(), new Set()), 'an unknown ID counts once the page has seen a history');
        assert.false(DropStatus.hasTerminalDrop(null, seen, new Set()));
        assert.false(DropStatus.hasTerminalDrop(undefined, seen, new Set()));
    });

    QUnit.test('showsReason only for failed or refused items with a reason', assert => {
        const time = '2026-11-20T20:00:00Z';
        assert.true(DropStatus.showsReason({name: 'a.zip', status: 'failed', time, reason: 'bad line 3'}));
        assert.true(DropStatus.showsReason({name: '.x', status: 'refused', time, reason: 'hidden file'}));
        assert.false(DropStatus.showsReason({name: 'a.zip', status: 'failed', time}));
        assert.false(DropStatus.showsReason({name: 'a.zip', status: 'failed', time, reason: ''}));
        assert.false(DropStatus.showsReason({name: 'a.zip', status: 'installed', time, reason: 'old'}));
        assert.false(DropStatus.showsReason({name: 'a.zip', status: 'installing', time, reason: 'old'}));
    });

    QUnit.test('removeName turns a bundle into its app name and keeps a Quadlet file name', assert => {
        assert.strictEqual(DropStatus.removeName('shop.zip'), 'shop');
        assert.strictEqual(DropStatus.removeName('web.container'), 'web.container');
        assert.strictEqual(DropStatus.removeName('data.volume'), 'data.volume');
        assert.strictEqual(DropStatus.removeName('my.app.zip'), 'my.app');
    });

    QUnit.test('hasNewDrop is true when a row for the uploaded name has an ID that was not already known', assert => {
        const known = new Set(['id-old']);
        const oldRow = {id: 'id-old', name: 'boy.container', status: 'installed', time: '2026-11-21T11:01:56Z'};
        const newRow = {id: 'id-new', name: 'boy.container', status: 'accepted', time: '2026-11-21T11:02:33Z'};
        const other = {id: 'id-other', name: 'other.container', status: 'accepted', time: '2026-11-21T11:02:33Z'};
        assert.true(DropStatus.hasNewDrop([newRow], 'boy.container', known));
        assert.true(DropStatus.hasNewDrop([oldRow, newRow], 'boy.container', known));
        assert.false(DropStatus.hasNewDrop([oldRow], 'boy.container', known), 'the row already in the history does not hide the notice');
        assert.false(DropStatus.hasNewDrop([other], 'boy.container', known), 'a new row of another name does not hide the notice');
        assert.false(DropStatus.hasNewDrop([], 'boy.container', known));
        assert.false(DropStatus.hasNewDrop(null, 'boy.container', known));
        assert.false(DropStatus.hasNewDrop(undefined, 'boy.container', known));
    });
});
