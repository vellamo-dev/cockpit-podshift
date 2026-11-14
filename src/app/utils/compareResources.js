/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Sort order for resource cards: built-in resources first, then the rest by name.
 *
 * @file compareResources.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/** @typedef {import('../types/module.js').ModuleItem} ModuleItem */

/**
 * Compares two resources for sorting: built-in ones come first, then all by title, A to Z.
 *
 * @param {ModuleItem} a First resource.
 * @param {ModuleItem} b Second resource.
 * @returns {number} Negative when a comes first, positive when b comes first, 0 when equal.
 */
export function compareResources(a, b) {
    const aBuiltin = a.source === 'builtin';
    const bBuiltin = b.source === 'builtin';
    if (aBuiltin !== bBuiltin) { return aBuiltin ? -1 : 1 }
    return a.title.localeCompare(b.title, undefined, {numeric: true, sensitivity: 'base'});
}
