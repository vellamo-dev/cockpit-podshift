/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Unit tests for QuadletUninstall, which decides whether and what a card's Uninstall removes.
 *
 * @file QuadletUninstall.test.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import QUnit from 'qunit';

import {QuadletUninstall} from '../../app/utils/QuadletUninstall.js';

QUnit.module('QuadletUninstall', () => {
    QUnit.test('fromOwner uninstalls a single file by its name', assert => {
        assert.deepEqual(QuadletUninstall.fromOwner({name: 'boy.container'}), {name: 'boy.container', isApp: false, file: 'boy.container'});
        assert.deepEqual(QuadletUninstall.fromOwner({name: 'data.volume', app: ''}), {name: 'data.volume', isApp: false, file: 'data.volume'});
        for (const name of ['a.pod', 'a.kube', 'a.network', 'a.image', 'a.build']) {
            assert.strictEqual(QuadletUninstall.fromOwner({name})?.name, name, name);
        }
    });

    QUnit.test('fromOwner uninstalls the whole app for a file in an app', assert => {
        assert.deepEqual(QuadletUninstall.fromOwner({name: 'db.container', app: 'shop'}), {name: 'shop', isApp: true, file: 'db.container'});
    });

    QUnit.test('fromOwner gives null for anything that is not a Quadlet file name', assert => {
        assert.strictEqual(QuadletUninstall.fromOwner(null), null);
        assert.strictEqual(QuadletUninstall.fromOwner(undefined), null);
        assert.strictEqual(QuadletUninstall.fromOwner({}), null);
        assert.strictEqual(QuadletUninstall.fromOwner({name: ''}), null);
        assert.strictEqual(QuadletUninstall.fromOwner({name: 'boy.service'}), null);
        assert.strictEqual(QuadletUninstall.fromOwner({name: '.container'}), null);
        assert.strictEqual(QuadletUninstall.fromOwner({name: 'dir/boy.container'}), null);
        assert.strictEqual(QuadletUninstall.fromOwner(/** @type {any} */ ({name: 42})), null);
    });

    QUnit.test('fromOwner ignores an app name with a slash and uninstalls the file', assert => {
        assert.deepEqual(QuadletUninstall.fromOwner({name: 'db.container', app: 'a/b'}), {name: 'db.container', isApp: false, file: 'db.container'});
    });

    QUnit.test('fromResource reads the quadlet field and gives null without it', assert => {
        assert.deepEqual(QuadletUninstall.fromResource({id: 'c1', title: 'boy', quadlet: {name: 'boy.container'}}), {name: 'boy.container', isApp: false, file: 'boy.container'});
        assert.deepEqual(QuadletUninstall.fromResource({id: 'pgdata', title: 'pgdata', quadlet: {name: 'pgdata.volume', app: 'shop'}}), {name: 'shop', isApp: true, file: 'pgdata.volume'});
        assert.strictEqual(QuadletUninstall.fromResource({id: 'loose', title: 'loose'}), null);
        assert.strictEqual(QuadletUninstall.fromResource(null), null);
    });

    QUnit.test('fromQuadlet uses the file name, or the app when the Quadlet is part of one', assert => {
        const base = {title: 'web', unitName: 'web.service', path: '/q/web.container', status: 'active/running', pod: '', description: ''};
        assert.deepEqual(QuadletUninstall.fromQuadlet({...base, id: 'web.container', app: ''}), {name: 'web.container', isApp: false, file: 'web.container'});
        assert.deepEqual(QuadletUninstall.fromQuadlet({...base, id: 'web.container', app: 'shop'}), {name: 'shop', isApp: true, file: 'web.container'});
        assert.strictEqual(QuadletUninstall.fromQuadlet({...base, id: 'notes.txt', app: ''}), null);
    });

    QUnit.test('offersVolumes is true for an app and a .volume file only', assert => {
        assert.true(QuadletUninstall.offersVolumes({name: 'shop', isApp: true, file: 'db.container'}));
        assert.true(QuadletUninstall.offersVolumes({name: 'data.volume', isApp: false, file: 'data.volume'}));
        assert.false(QuadletUninstall.offersVolumes({name: 'boy.container', isApp: false, file: 'boy.container'}));
        assert.false(QuadletUninstall.offersVolumes({name: 'front.network', isApp: false, file: 'front.network'}));
    });

    QUnit.test('listHas finds the resources and Quadlets that a queued Uninstall removes', assert => {
        const web = {id: 'systemd-web', title: 'web', quadlet: {name: 'web.container'}};
        const shopDb = {id: 'shop-db', title: 'shop-db', quadlet: {name: 'db.container', app: 'shop'}};
        const plain = {id: 'other', title: 'other'};
        const quadlet = {id: 'data.volume', title: 'data', app: ''};
        const inApp = {id: 'front.network', title: 'front', app: 'shop'};
        assert.true(QuadletUninstall.listHas([plain, web], 'web.container'), 'a container of a single file');
        assert.true(QuadletUninstall.listHas([shopDb], 'shop'), 'a container of an app');
        assert.false(QuadletUninstall.listHas([shopDb], 'db.container'), 'a file of an app goes by the app name');
        assert.true(QuadletUninstall.listHas([quadlet], 'data.volume'), 'a Quadlets tab file');
        assert.true(QuadletUninstall.listHas([inApp], 'shop'), 'a Quadlets tab file of an app');
        assert.false(QuadletUninstall.listHas([plain, web], 'shop'), 'gone');
        assert.false(QuadletUninstall.listHas([], 'web.container'));
        assert.false(QuadletUninstall.listHas(null, 'web.container'));
    });
});
