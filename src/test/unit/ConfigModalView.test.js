/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Unit tests for ConfigModalView, the modes of the Configuration card's variable modal.
 *
 * @file ConfigModalView.test.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import QUnit from 'qunit';

import {ConfigModalView} from '../../app/utils/ConfigModalView.js';

QUnit.module('ConfigModalView', () => {
    QUnit.test('add mode has an open name, Save and no Remove', assert => {
        assert.deepEqual(ConfigModalView.layout('add', false), {
            title: 'add', showForm: true, nameLocked: false, showRemove: false, showSave: true, showConfirm: false
        });
    });

    QUnit.test('add mode never confirms a removal', assert => {
        assert.deepEqual(ConfigModalView.layout('add', true), ConfigModalView.layout('add', false));
    });

    QUnit.test('edit mode locks the name and shows Save and Remove', assert => {
        assert.deepEqual(ConfigModalView.layout('edit', false), {
            title: 'edit', showForm: true, nameLocked: true, showRemove: true, showSave: true, showConfirm: false
        });
    });

    QUnit.test('Remove in edit mode switches the same modal to the confirmation', assert => {
        assert.deepEqual(ConfigModalView.layout('edit', true), {
            title: 'remove', showForm: false, nameLocked: true, showRemove: false, showSave: false, showConfirm: true
        });
    });
});
