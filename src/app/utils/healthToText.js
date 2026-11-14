/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Plain-text form of a health-check result, for the Copy menu item.
 *
 * @file healthToText.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/** @typedef {import('../types/health.js').HealthResult} HealthResult */

/**
 * Builds the plain-text form of the Health card: title, summary, then each group and its rows.
 *
 * @param {string} title Card title, the first line.
 * @param {HealthResult|null} data Health-check result, or null before it has loaded.
 * @returns {string} The text, one line per item.
 */
export function healthToText(title, data) {
    const lines = [title];
    if (!data) { return lines.join('\n') }
    if (data.summary?.label) { lines.push(data.summary.label) }
    (data.groups || []).forEach(group => {
        lines.push('');
        lines.push(group.label);
        (group.rows || []).forEach(row => {
            lines.push(`${row.label}: ${row.value}`);
            if (row.fix) { lines.push(`  Fix: ${row.fix}`) }
        });
    });
    return lines.join('\n');
}
