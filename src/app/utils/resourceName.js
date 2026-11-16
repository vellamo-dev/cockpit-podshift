/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Display name of a resource card for titles and messages, and the inspect download file name.
 *
 * @file resourceName.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/** @typedef {import('../types/resource.js').ResourceItem} ResourceItem */

/**
 * Returns the download file name of an inspect output: <kind>-<name>-inspect.json, with the name
 * reduced to letters, digits, dot, underscore and dash, so it is safe in a Content-Disposition header.
 *
 * @param {string} kind Resource kind, for example container.
 * @param {string} name Display name of the resource.
 * @returns {string} The file name.
 */
export function inspectFileName(kind, name) {
    const safe = String(name || '')
            .replace(/[^A-Za-z0-9._-]+/g, '_')
            .replace(/^[._]+/, '') || 'resource';
    return `${kind}-${safe}-inspect.json`;
}

/**
 * Returns the name of a resource, or its short ID when it has no name, for example a
 * dangling image titled "<none>".
 *
 * @param {ResourceItem} item The resource.
 * @returns {string} The name, or the first 12 characters of the ID.
 */
export function resourceDisplayName(item) {
    if (item.title && item.title !== '<none>') { return item.title }
    return String(item.id || '').slice(0, 12);
}

/**
 * Returns a service unit name without the .service suffix, for display only, for example
 * web.service becomes web. Other names, such as podman.socket, are returned as they are.
 * Searching, links and actions keep the full unit name.
 *
 * @param {string} unit Unit name, for example web.service.
 * @returns {string} The name to show.
 */
export function serviceDisplayName(unit) {
    const name = String(unit || '');
    return name.endsWith('.service') && name.length > '.service'.length
        ? name.slice(0, -'.service'.length)
        : name;
}
