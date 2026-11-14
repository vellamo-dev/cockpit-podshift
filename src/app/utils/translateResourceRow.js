/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Prepares a main resource card row from a list action for display.
 *
 * @file translateResourceRow.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {i18n} from './i18n.js';
import {formatCreated} from './formatCreated.js';

/** @typedef {import('../types/card.js').PropertyRow} PropertyRow */
/** @typedef {import('../types/resource.js').ResourceRow} ResourceRow */

/**
 * Translates a main row label. The "Unused" used-by value is translated too,
 * and the created and updated times are shown as a local date with its age.
 *
 * @param {ResourceRow} row The row from the API.
 * @returns {PropertyRow} The row ready for display.
 */
export function translateResourceRow(row) {
    let value = row.value;
    if (row.id === 'used-by' && row.value === 'Unused') { value = i18n("Unused") } else if ((row.id === 'created' || row.id === 'updated') && row.value) { value = formatCreated(String(row.value)) }
    return {...row, label: i18n(row.label), value};
}
