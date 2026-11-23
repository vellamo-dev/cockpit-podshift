/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Unit tests for LogOrder, the stored display order of the install log.
 *
 * @file LogOrder.test.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import QUnit from 'qunit';

import {JournalText} from '../../app/utils/JournalText.js';
import {LogOrder} from '../../app/utils/LogOrder.js';

/**
 * Returns a getter of a small in-memory storage.
 *
 * @param {Record<string, string>} values Initial values.
 * @returns {() => Storage} The getter.
 */
function memory(values = {}) {
    const storage = {
        getItem: key => (key in values ? values[key] : null),
        setItem: (key, value) => { values[key] = String(value) }
    };
    return () => /** @type {Storage} */ (/** @type {unknown} */ (storage));
}

QUnit.module('LogOrder', () => {
    QUnit.test('nothing stored gives newest first', assert => {
        assert.strictEqual(LogOrder.read(memory()), 'newest');
    });

    QUnit.test('a stored value is read back', assert => {
        assert.strictEqual(LogOrder.read(memory({[LogOrder.KEY]: 'oldest'})), 'oldest');
        assert.strictEqual(LogOrder.read(memory({[LogOrder.KEY]: 'newest'})), 'newest');
    });

    QUnit.test('an unknown value gives newest first', assert => {
        assert.strictEqual(LogOrder.read(memory({[LogOrder.KEY]: 'sideways'})), 'newest');
        assert.strictEqual(LogOrder.read(memory({[LogOrder.KEY]: ''})), 'newest');
    });

    QUnit.test('storage that throws gives newest first and write does not throw', assert => {
        /** Denies access to the storage, like private mode. */
        function noAccess() { throw new Error('SecurityError') }
        /**
         * Returns storage whose every call throws.
         *
         * @returns {Storage} The storage.
         */
        function broken() {
            return /** @type {Storage} */ (/** @type {unknown} */ ({
                getItem: () => { throw new Error('denied') },
                setItem: () => { throw new Error('QuotaExceededError') }
            }));
        }
        assert.strictEqual(LogOrder.read(noAccess), 'newest');
        assert.strictEqual(LogOrder.read(broken), 'newest');
        LogOrder.write(noAccess, 'oldest');
        LogOrder.write(broken, 'oldest');
        assert.ok(true, 'no exception');
    });

    QUnit.test('write stores the value under the key', assert => {
        const values = {};
        LogOrder.write(memory(values), 'oldest');
        assert.deepEqual(values, {[LogOrder.KEY]: 'oldest'});
    });

    QUnit.test('apply orders both ways without changing the input', assert => {
        const entries = [1, 2, 3];
        assert.deepEqual(LogOrder.apply(entries, 'newest'), [3, 2, 1]);
        assert.deepEqual(LogOrder.apply(entries, 'oldest'), [1, 2, 3]);
        assert.deepEqual(entries, [1, 2, 3], 'input unchanged');
        assert.deepEqual(LogOrder.apply([], 'newest'), []);
    });

    QUnit.test('the copied install log text has the shown lines in the shown order', assert => {
        const entries = [
            {time: '2026-11-21T14:27:23Z', hostname: 'fedora-server', identifier: 'podshift-drop-process', pid: 265401, priority: 6, message: 'accepted a.container'},
            {time: '2026-11-21T14:27:24Z', hostname: 'fedora-server', identifier: 'podshift-qdl-install', priority: 6, message: 'installed a.container'}
        ];
        const first = '2026-11-21T14:27:23+00:00 fedora-server podshift-drop-process[265401]: accepted a.container';
        const second = '2026-11-21T14:27:24+00:00 fedora-server podshift-qdl-install: installed a.container';
        assert.strictEqual(JournalText.toText(LogOrder.apply(entries, 'oldest')), `${first}\n${second}\n`);
        assert.strictEqual(JournalText.toText(LogOrder.apply(entries, 'newest')), `${second}\n${first}\n`);
        assert.strictEqual(JournalText.toText(LogOrder.apply([], 'newest')), '', 'no lines give empty text, so Copy log is disabled');
    });
});
