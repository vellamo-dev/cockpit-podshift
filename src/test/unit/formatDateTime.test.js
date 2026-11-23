/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Unit tests for formatDateTime, the short local date and time of the drop-quadlet tab.
 *
 * @file formatDateTime.test.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import QUnit from 'qunit';

import {formatDateTime} from '../../app/utils/formatDateTime.js';

// 20 November 2026, 20:05:42 local time, so the result does not depend on the time zone.
const EVENING = new Date(2026, 10, 20, 20, 5, 42);

QUnit.module('formatDateTime', () => {
    QUnit.test('en-GB gives day, month and year, then 24-hour time', assert => {
        const text = formatDateTime(EVENING, 'en-GB');
        assert.ok(text.startsWith('20/11/2026'), text);
        assert.ok(/20:05$/.test(text), text);
    });

    QUnit.test('fi-FI gives the Finnish order and separators, in 24-hour time', assert => {
        const text = formatDateTime(EVENING, 'fi-FI');
        assert.ok(text.startsWith('20.11.2026'), text);
        assert.ok(/20[.:]05$/.test(text), text);
    });

    QUnit.test('en-US also uses 24-hour time', assert => {
        const text = formatDateTime(EVENING, 'en-US');
        assert.ok(text.startsWith('11/20/2026'), text);
        assert.ok(/20:05$/.test(text), text);
    });

    QUnit.test('no weekday, no seconds and no AM or PM', assert => {
        for (const locale of ['en-GB', 'fi-FI', 'en-US']) {
            const text = formatDateTime(EVENING, locale);
            assert.notOk(/AM|PM|ap\.|ip\./i.test(text), `${locale}: ${text}`);
            assert.notOk(/Fri|perjantai|pe\b/i.test(text), `${locale}: ${text}`);
            assert.notOk(text.includes('42'), `${locale}: ${text}`);
        }
    });

    QUnit.test('accepts ISO text and milliseconds, and returns other text unchanged', assert => {
        const iso = EVENING.toISOString();
        assert.strictEqual(formatDateTime(iso, 'en-GB'), formatDateTime(EVENING, 'en-GB'));
        assert.strictEqual(formatDateTime(EVENING.getTime(), 'en-GB'), formatDateTime(EVENING, 'en-GB'));
        assert.strictEqual(formatDateTime('not a time', 'en-GB'), 'not a time');
    });
});
