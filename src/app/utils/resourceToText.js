/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Plain-text form of a resource card, for the Copy menu item.
 *
 * @file resourceToText.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {i18n} from './i18n.js';

/** @typedef {import('../types/card.js').PropertyRow} PropertyRow */
/** @typedef {import('../types/resource.js').ResourceText} ResourceText */

/**
 * Adds one "Label: value" line per row to the list of lines.
 *
 * @param {string[]} lines Lines to add to; changed in place.
 * @param {PropertyRow[]} [rows] Rows to add.
 */
function appendRows(lines, rows) {
    (rows || []).forEach(row => {
        const value = row.value == null ? i18n("Not set") : row.value;
        lines.push(`${row.label}: ${value}`);
    });
}

/**
 * Builds the plain-text form of a resource card: title, optional description and subtitle, status and source, main rows, then each group.
 *
 * @param {ResourceText} card What the card shows.
 * @returns {string} The text, one line per item.
 */
export function resourceToText({title, description, subtitle, status, source, rows, groups}) {
    const lines = [title];
    if (description) { lines.push(description) }
    if (subtitle) { lines.push(subtitle) }
    if (status) { lines.push(`${i18n("Status")}: ${status}`) }
    if (source) { lines.push(`${i18n("Source")}: ${source}`) }
    appendRows(lines, rows);
    (groups || []).forEach(group => {
        if (!group.rows || group.rows.length === 0) { return }
        lines.push('');
        lines.push(group.label);
        appendRows(lines, group.rows);
    });
    return lines.join('\n');
}
