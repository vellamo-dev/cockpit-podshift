/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Unit tests for createInFlight, the counter behind the refreshing flag of the load hooks.
 *
 * @file inFlight.test.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import QUnit from 'qunit';

import {createInFlight} from '../../app/utils/inFlight.js';

QUnit.module('createInFlight', () => {
    QUnit.test('one load reports busy, then idle', assert => {
        const changes = [];
        const counter = createInFlight(busy => changes.push(busy));
        counter.begin();
        assert.strictEqual(counter.count(), 1);
        counter.end();
        assert.strictEqual(counter.count(), 0);
        assert.deepEqual(changes, [true, false]);
    });

    QUnit.test('overlapping loads give one busy period that ends with the last load', assert => {
        const changes = [];
        const counter = createInFlight(busy => changes.push(busy));
        counter.begin();
        counter.begin();
        counter.end();
        assert.deepEqual(changes, [true], 'still busy while one load runs');
        counter.end();
        assert.deepEqual(changes, [true, false]);
    });

    QUnit.test('an extra end does not go below zero or report again', assert => {
        const changes = [];
        const counter = createInFlight(busy => changes.push(busy));
        counter.end();
        counter.begin();
        counter.end();
        counter.end();
        assert.strictEqual(counter.count(), 0);
        assert.deepEqual(changes, [true, false]);
    });

    QUnit.test('a new load after idle reports busy again', assert => {
        const changes = [];
        const counter = createInFlight(busy => changes.push(busy));
        counter.begin();
        counter.end();
        counter.begin();
        assert.deepEqual(changes, [true, false, true]);
    });
});
