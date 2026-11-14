/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Plain-text form of a properties card, and the clipboard helper for the Copy menu item.
 *
 * @file rowsToText.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {i18n} from './i18n.js';

/** @typedef {import('../types/card.js').PropertyRow} PropertyRow */

/**
 * Builds the plain-text form of a properties card: title, then one "Label: value" line per row.
 *
 * @param {string} title Card title, the first line.
 * @param {PropertyRow[]|null} rows Card rows, or null before they have loaded.
 * @returns {string} The text, one line per item.
 */
export function rowsToText(title, rows) {
    const lines = [title];
    (rows || []).forEach(row => {
        const value = row.value == null ? i18n("Not set") : row.value;
        lines.push(`${row.label}: ${value}`);
    });
    return lines.join('\n');
}

/**
 * Copies a text to the clipboard; a failure is only logged.
 *
 * @param {string} text Text to copy.
 * @returns {Promise<void>} Resolves when done, also on failure.
 */
export function copyText(text) {
    return navigator.clipboard.writeText(text).catch(err => {
        console.warn('Failed to copy card text', err);
    });
}
