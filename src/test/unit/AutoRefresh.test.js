/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Unit tests for AutoRefresh, the countdown rule of the header auto refresh.
 *
 * @file AutoRefresh.test.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import QUnit from 'qunit';

import {AutoRefresh} from '../../app/utils/AutoRefresh.js';

QUnit.module('AutoRefresh', () => {
    QUnit.test('auto refresh stays on for 4 minutes', assert => {
        assert.strictEqual(AutoRefresh.OFF_AFTER_MS, 240000);
        assert.strictEqual(AutoRefresh.offAfterMinutes(), 4);
    });

    QUnit.test('msLeft counts down from 4 minutes to 0', assert => {
        const start = 1000000;
        assert.strictEqual(AutoRefresh.msLeft(start, start), 240000, 'right after the start');
        assert.strictEqual(AutoRefresh.msLeft(start, start + 60000), 180000, 'after one minute');
        assert.strictEqual(AutoRefresh.msLeft(start, start + 239999), 1, 'just before the end');
        assert.strictEqual(AutoRefresh.msLeft(start, start + 240000), 0, 'at the end');
        assert.strictEqual(AutoRefresh.msLeft(start, start + 999999), 0, 'long after the end');
        assert.strictEqual(AutoRefresh.msLeft(start, start - 5000), 240000, 'the clock went back');
    });
});
