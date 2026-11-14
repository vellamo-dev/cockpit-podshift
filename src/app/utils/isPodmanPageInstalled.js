/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Checks whether the Cockpit Podman page is installed.
 *
 * @file isPodmanPageInstalled.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import cockpit from './cockpitTyped.js';

/**
 * Checks whether a window's Cockpit object lists the podman package.
 * Reading another window can throw, so errors count as not installed.
 *
 * @param {Window} win The window to check.
 * @returns {boolean} True when that window's cockpit.manifests has podman.
 */
function hasPodmanManifest(win) {
    try {
        return Boolean((win).cockpit?.manifests?.podman);
    } catch (_) {
        return false;
    }
}

/**
 * Checks whether the Cockpit Podman page is installed.
 * Our page runs in a Shell frame without its own manifests, so it also asks
 * the parent Shell window, the same way Cockpit's FileChooser does.
 *
 * @returns {boolean} True when cockpit.manifests lists the podman package.
 */
export function isPodmanPageInstalled() {
    if (cockpit.manifests?.podman) { return true }
    return hasPodmanManifest(window) || hasPodmanManifest(window.parent);
}
