/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Unit tests for healthLoadNeeded, which decides when the shared health check loads again.
 *
 * @file healthLoad.test.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import QUnit from 'qunit';

import {healthLoadNeeded} from '../../app/utils/healthLoad.js';

QUnit.module('healthLoadNeeded', () => {
    QUnit.test('the first load starts', assert => {
        assert.true(healthLoadNeeded(false, null, 0, 0));
        assert.true(healthLoadNeeded(true, null, 0, 0));
    });

    QUnit.test('the same token reuses the result without fresh', assert => {
        assert.false(healthLoadNeeded(false, 0, 0, 0));
        assert.false(healthLoadNeeded(false, 0, 0, 1));
    });

    QUnit.test('a new token loads again', assert => {
        assert.true(healthLoadNeeded(false, 0, 1, 0));
        assert.true(healthLoadNeeded(false, 0, 1, 1));
        assert.true(healthLoadNeeded(true, 0, 1, 1));
    });

    QUnit.test('fresh loads again for the same token when no check runs', assert => {
        assert.true(healthLoadNeeded(true, 0, 0, 0));
    });

    QUnit.test('fresh does not start a second check while one runs for the same token', assert => {
        assert.false(healthLoadNeeded(true, 0, 0, 1));
    });
});
