/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared data shapes for cards: label/value rows, row groups and kebab menu items.
 *
 * @file card.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * One label/value row in a card table.
 *
 * @typedef {object} PropertyRow
 * @property {string} [id] Stable key; the label is used when it is missing.
 * @property {string} label Text in the label column.
 * @property {import('react').ReactNode} [value] Text in the value column; null or missing shows "Not set".
 * @property {boolean} [mono] Shows the value in a monospace font, for example a command.
 * @property {string} [unit] Unit name; when set, the label links to a services page.
 * @property {'user'|'system'} [scope] Unit scope; 'user' opens our Services tab with this unit as the filter, 'system' or missing opens Cockpit's Services page.
 */

/**
 * A titled group of rows below the main rows of a resource card.
 *
 * @typedef {object} PropertyGroup
 * @property {string} [id] Stable key; the label is used when it is missing.
 * @property {string} label Group heading.
 * @property {PropertyRow[]} [rows] Rows of the group; a group without rows is hidden.
 */

/**
 * One item in a card's kebab menu.
 *
 * @typedef {object} MenuItem
 * @property {string} key Stable React key.
 * @property {string} label Text shown in the menu.
 * @property {() => void} onClick Called when the item is chosen.
 * @property {boolean} [isDisabled] Greys the item out.
 */

/**
 * A separator line between items in a card's kebab menu.
 *
 * @typedef {object} MenuDivider
 * @property {string} key Stable React key.
 * @property {true} divider Marks the entry as a divider.
 */

/**
 * PatternFly Label status of a resource card's status text.
 *
 * @typedef {'success'|'warning'|'danger'|'info'|'custom'} CardStatusVariant
 */

/**
 * Status tone of a resource card: the colour of its corner tint.
 * neutral: nothing notable; success: running or in use; danger: a problem.
 *
 * @typedef {'neutral'|'success'|'danger'} CardTone
 */

export {};
