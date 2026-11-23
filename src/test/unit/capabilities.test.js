/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Unit tests for the capabilities helpers that pick the tabs and features to show.
 *
 * @file capabilities.test.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import QUnit from 'qunit';

import {buildAvailableSet, hasCapability, isAvailable, visibleModules} from '../../app/utils/capabilities.js';

const DATA = {
    actions: [
        {action: 'overview-status', status: 'active'},
        {action: 'containers-list', status: 'active'},
        {action: 'inspect', status: 'deprecated'},
        {action: 'secrets-list', status: 'retired'}
    ]
};

const MODULES = [
    {id: 'overview', requires: ['overview-status']},
    {id: 'drop-quadlet', requires: ['quadlet-drop']},
    {id: 'containers', requires: ['containers-list']},
    {id: 'secrets', requires: ['secrets-list']},
    {id: 'about'}
];

/**
 * Returns the ids of a module list.
 *
 * @param {{id: string}[]} list Modules.
 * @returns {string[]} Their ids.
 */
function ids(list) {
    return list.map(item => item.id);
}

QUnit.module('capabilities', () => {
    QUnit.test('buildAvailableSet keeps active and deprecated actions and drops retired ones', assert => {
        const available = buildAvailableSet(DATA);
        assert.deepEqual([...available].sort(), ['containers-list', 'inspect', 'overview-status']);
        assert.notOk(available.has('secrets-list'), 'retired is excluded');
    });

    QUnit.test('buildAvailableSet gives an empty set for anything that is not a list of actions', assert => {
        for (const data of [null, undefined, {}, {actions: null}, {actions: 'inspect'}, {actions: {}}, 'x']) {
            assert.strictEqual(buildAvailableSet(data).size, 0, JSON.stringify(data));
        }
        assert.strictEqual(buildAvailableSet({actions: [null, {status: 'active'}, {action: ''}, {action: 7}]}).size, 0, 'bad entries are skipped');
    });

    QUnit.test('isAvailable: an empty list is always available, a missing action is not', assert => {
        const available = buildAvailableSet(DATA);
        assert.ok(isAvailable(available, []));
        assert.ok(isAvailable(available));
        assert.ok(isAvailable(available, ['overview-status', 'inspect']));
        assert.notOk(isAvailable(available, ['overview-status', 'quadlet-drop']));
        assert.ok(isAvailable(null, ['quadlet-drop']), 'an unknown set hides nothing');
    });

    QUnit.test('visibleModules hides tabs whose required actions are missing once the list is read', assert => {
        const caps = {status: 'ready', available: buildAvailableSet(DATA), error: null};
        assert.deepEqual(ids(visibleModules(MODULES, caps)), ['overview', 'containers', 'about']);
    });

    QUnit.test('visibleModules shows no tab while the list loads for the first time', assert => {
        assert.deepEqual(visibleModules(MODULES, {status: 'loading', available: null, error: null}), []);
    });

    QUnit.test('visibleModules shows every tab after an error', assert => {
        assert.deepEqual(ids(visibleModules(MODULES, {status: 'error', available: null, error: new Error('INTERNAL')})), ids(MODULES));
    });

    QUnit.test('hasCapability hides an action only when the list is read', assert => {
        const ready = {status: 'ready', available: buildAvailableSet(DATA), error: null};
        assert.ok(hasCapability(ready, 'inspect'));
        assert.notOk(hasCapability(ready, 'secrets-list'));
        assert.ok(hasCapability({status: 'loading', available: null, error: null}, 'secrets-list'));
        assert.ok(hasCapability({status: 'error', available: null, error: new Error('x')}, 'secrets-list'));
    });
});
