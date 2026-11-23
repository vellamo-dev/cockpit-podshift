/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Unit tests for UninstallRefresh, the poll schedule of the tabs with Uninstall.
 *
 * @file UninstallRefresh.test.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import QUnit from 'qunit';

import {UninstallRefresh} from '../../app/utils/UninstallRefresh.js';

QUnit.module('UninstallRefresh', () => {
    QUnit.test('after an Uninstall the list polls every 1 s, then 2 s, then 5 s until 2 minutes', assert => {
        const cases = [[0, 1000], [14999, 1000], [15000, 2000], [29999, 2000], [30000, 5000], [119999, 5000]];
        for (const [ms, delay] of cases) {
            assert.strictEqual(UninstallRefresh.pollDelay(true, ms), delay, `at ${ms} ms`);
        }
        assert.strictEqual(UninstallRefresh.FOR_MS, 120000);
    });

    QUnit.test('turned on by hand, or after the Uninstall steps, the list polls every 10 s', assert => {
        assert.strictEqual(UninstallRefresh.pollDelay(true, NaN), 10000, 'no Uninstall');
        assert.strictEqual(UninstallRefresh.pollDelay(true, 120000), 10000, 'after 2 minutes');
        assert.strictEqual(UninstallRefresh.pollDelay(true, -5), 10000, 'a clock step back counts as no Uninstall');
    });

    QUnit.test('nothing polls while auto refresh is off', assert => {
        assert.strictEqual(UninstallRefresh.pollDelay(false, 0), 0);
        assert.strictEqual(UninstallRefresh.pollDelay(false, NaN), 0);
    });
});
