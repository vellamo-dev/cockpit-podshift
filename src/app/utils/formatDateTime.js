/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Short local date and time for lists, for example "20/11/2026, 20:05" in en-GB.
 *
 * @file formatDateTime.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * Options of the format: day, month and year as two digits (four for the year), hours and
 * minutes, always 24-hour. No weekday and no seconds.
 *
 * @type {Intl.DateTimeFormatOptions}
 */
const OPTIONS = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
};

/**
 * Formats a time as a short local date and time in 24-hour form. The order of the parts and the
 * separators follow the locale, by default the browser's. Text that is not a valid time is returned unchanged.
 *
 * @param {string|number|Date} value ISO 8601 time, milliseconds since the epoch, or a Date.
 * @param {string} [locale] Locale, for example 'fi-FI'; the browser's when not given.
 * @returns {string} The formatted time, or the value as text when it is not a valid time.
 */
export function formatDateTime(value, locale) {
    const time = value instanceof Date ? value.getTime() : (typeof value === 'number' ? value : Date.parse(value));
    if (Number.isNaN(time)) { return String(value) }
    return new Intl.DateTimeFormat(locale, OPTIONS).format(time);
}
