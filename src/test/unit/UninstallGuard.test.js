/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Unit tests for UninstallGuard, which keeps a queued Uninstall from being queued twice.
 *
 * @file UninstallGuard.test.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import QUnit from 'qunit';

import {UninstallGuard} from '../../app/utils/UninstallGuard.js';

QUnit.module('UninstallGuard', hooks => {
    hooks.beforeEach(() => UninstallGuard.clear());
    hooks.after(() => UninstallGuard.clear());

    QUnit.test('a name is queued from mark until HOLD_MS later', assert => {
        assert.false(UninstallGuard.isQueued('boy.container', 1000), 'nothing is queued at first');
        UninstallGuard.mark('boy.container', 1000);
        assert.true(UninstallGuard.isQueued('boy.container', 1000));
        assert.true(UninstallGuard.isQueued('boy.container', 1000 + UninstallGuard.HOLD_MS - 1));
        assert.false(UninstallGuard.isQueued('boy.container', 1000 + UninstallGuard.HOLD_MS));
        assert.false(UninstallGuard.isQueued('boy.container', 1000), 'an ended entry is forgotten');
    });

    QUnit.test('names are kept apart', assert => {
        UninstallGuard.mark('shop', 0);
        assert.true(UninstallGuard.isQueued('shop', 10));
        assert.false(UninstallGuard.isQueued('boy.container', 10));
    });

    QUnit.test('a new mark starts the hold again', assert => {
        UninstallGuard.mark('shop', 0);
        UninstallGuard.mark('shop', 30000);
        assert.true(UninstallGuard.isQueued('shop', UninstallGuard.HOLD_MS + 1000));
    });

    QUnit.test('msUntilNextEnd gives the wait until the first entry ends', assert => {
        assert.strictEqual(UninstallGuard.msUntilNextEnd(0), null, 'null when nothing is queued');
        UninstallGuard.mark('a.container', 0);
        UninstallGuard.mark('b.volume', 20000);
        assert.strictEqual(UninstallGuard.msUntilNextEnd(10000), UninstallGuard.HOLD_MS - 10000);
        assert.strictEqual(UninstallGuard.msUntilNextEnd(UninstallGuard.HOLD_MS), 20000, 'an ended entry is skipped');
        assert.strictEqual(UninstallGuard.msUntilNextEnd(UninstallGuard.HOLD_MS + 20000), null);
    });
});
