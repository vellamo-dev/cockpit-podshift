/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Formats a creation time from the handler as a local date with its age.
 *
 * @file formatCreated.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {dateShort, distanceToNow} from 'timeformat';

/**
 * Formats an ISO 8601 time, for example 2026-11-05T10:12:00Z, as a short local date and its age,
 * for example "11/5/2026 (6 days ago)". Text that is not a valid time is returned unchanged.
 *
 * @param {string} value ISO 8601 time from the handler.
 * @returns {string} The formatted date and age, or the value itself.
 */
export function formatCreated(value) {
    const time = Date.parse(value);
    if (Number.isNaN(time)) { return value }
    return `${dateShort(time)} (${distanceToNow(time)})`;
}
