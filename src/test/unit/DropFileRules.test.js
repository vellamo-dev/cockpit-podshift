/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Unit tests for DropFileRules, the file name rules of the drop-quadlet tab.
 *
 * @file DropFileRules.test.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import QUnit from 'qunit';

import {DropFileRules} from '../../app/utils/DropFileRules.js';

QUnit.module('DropFileRules', () => {
    QUnit.test('extension returns the last extension with its dot', assert => {
        assert.strictEqual(DropFileRules.extension('web.container'), '.container');
        assert.strictEqual(DropFileRules.extension('app.tar.zip'), '.zip');
        assert.strictEqual(DropFileRules.extension('README'), '');
        assert.strictEqual(DropFileRules.extension('.container'), '', 'a hidden name has no extension');
    });

    QUnit.test('check accepts the Quadlet types and zip bundles', assert => {
        for (const name of ['web.container', 'data.volume', 'front.network', 'base.image', 'shop.zip']) {
            assert.strictEqual(DropFileRules.check(name), null, name);
        }
    });

    QUnit.test('check refuses other extensions, also in other cases', assert => {
        for (const name of ['web.pod', 'web.kube', 'web.build', 'notes.txt', 'README', 'web.Container', 'shop.ZIP', 'web.container.bak']) {
            assert.strictEqual(DropFileRules.check(name), 'BAD_EXTENSION', name);
        }
    });

    QUnit.test('check refuses hidden and empty names', assert => {
        assert.strictEqual(DropFileRules.check('.web.container'), 'HIDDEN');
        assert.strictEqual(DropFileRules.check('.container'), 'HIDDEN');
        assert.strictEqual(DropFileRules.check(''), 'NO_NAME');
        assert.strictEqual(DropFileRules.check(undefined), 'NO_NAME');
    });

    QUnit.test('the accept option lists exactly the accepted extensions', assert => {
        const listed = Object.values(DropFileRules.ACCEPT).flat();
        const expected = [...DropFileRules.EXTENSIONS];
        assert.deepEqual(listed.sort(), expected.sort());
    });

    QUnit.test('check refuses folder parts like quadlet-drop', assert => {
        for (const name of ['a/web.container', '../web.container', 'a\\web.container']) {
            assert.strictEqual(DropFileRules.check(name), 'BAD_PATH', name);
        }
    });

    QUnit.test('check applies is-valid-app-name to the base name', assert => {
        for (const name of ['v1.2.container', 'shop_api.zip', 'app-net.network', '9.volume']) {
            assert.strictEqual(DropFileRules.check(name), null, name);
        }
        for (const name of ['-web.container', '_web.volume', 'my web.container', 'we$b.image', 'w\u00e9b.container', 'web.container.zip', 'app.pod.container', 'x.qdl-bundle.zip']) {
            assert.strictEqual(DropFileRules.check(name), 'BAD_NAME', name);
        }
    });

    QUnit.test('checkSize accepts 1 byte to 50 KB', assert => {
        assert.strictEqual(DropFileRules.MAX_BYTES, 51200);
        assert.strictEqual(DropFileRules.checkSize(1), null);
        assert.strictEqual(DropFileRules.checkSize(51200), null);
        assert.strictEqual(DropFileRules.checkSize(51201), 'TOO_LARGE');
        assert.strictEqual(DropFileRules.checkSize(0), 'EMPTY');
        assert.strictEqual(DropFileRules.checkSize(NaN), 'EMPTY');
    });

    QUnit.test('toBase64 is standard, padded base64 without line breaks', assert => {
        /**
         * Returns the bytes of a text of single-byte characters.
         *
         * @param {string} chars Text of single-byte characters.
         * @returns {Uint8Array} Its bytes.
         */
        function text(chars) { return new Uint8Array([...chars].map(c => c.charCodeAt(0))) }
        assert.strictEqual(DropFileRules.toBase64(new Uint8Array([])), '');
        assert.strictEqual(DropFileRules.toBase64(text('A')), 'QQ==');
        assert.strictEqual(DropFileRules.toBase64(text('AB')), 'QUI=');
        assert.strictEqual(DropFileRules.toBase64(text('ABC')), 'QUJD');
        assert.strictEqual(DropFileRules.toBase64(text('[Unit]\nDescription=Web\n')), 'W1VuaXRdCkRlc2NyaXB0aW9uPVdlYgo=');
    });

    QUnit.test('toBase64 keeps every binary byte value, also over one chunk', assert => {
        const all = new Uint8Array(256).map((_, i) => i);
        assert.strictEqual(DropFileRules.toBase64(all), Buffer.from(all).toString('base64'));
        assert.strictEqual(DropFileRules.toBase64(new Uint8Array([0xff, 0xfe, 0x00])), '//4A');
        const big = new Uint8Array(51200).map((_, i) => (i * 7 + 3) % 256);
        const encoded = DropFileRules.toBase64(big);
        assert.strictEqual(encoded, Buffer.from(big).toString('base64'));
        assert.strictEqual(encoded.length, 68268, 'the base64 length of 50 KB, the backend limit');
        assert.notOk(/\s/.test(encoded), 'no line breaks');
    });
});
