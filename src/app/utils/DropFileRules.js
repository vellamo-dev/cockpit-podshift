/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * File rules of the drop-quadlet tab, the same as PodShift's quadlet-drop action checks:
 * a plain, not hidden name, a Quadlet type of PODSHIFT_DROP_QUADLET_EXTENSIONS or a .zip
 * bundle, a base name that passes is-valid-app-name, and 1 byte to 50 KB
 * (PODSHIFT_DROP_MAX_BUNDLE_SIZE). Also the base64 encoding of the upload.
 *
 * @file DropFileRules.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/** @typedef {import('../types/drop.js').DropNameProblem} DropNameProblem */
/** @typedef {import('../types/drop.js').DropSizeProblem} DropSizeProblem */

/**
 * Checks files dropped on the drop-quadlet tab and encodes them for upload.
 */
export class DropFileRules {
    /**
     * Accepted extensions, in the order shown to the user. The match is case-sensitive, like PodShift's.
     *
     * @type {string[]}
     */
    static EXTENSIONS = ['.container', '.volume', '.network', '.image', '.zip'];

    /**
     * Largest accepted file in bytes: 50 KB, PodShift's PODSHIFT_DROP_MAX_BUNDLE_SIZE, for a
     * Quadlet file and a .zip alike.
     *
     * @type {number}
     */
    static MAX_BYTES = 50 * 1024;

    /**
     * Endings that is-valid-app-name refuses for the name without its extension, because Podman
     * refuses an application name that ends like a Quadlet file.
     *
     * @type {string[]}
     */
    static RESERVED_ENDINGS = ['.artifact', '.build', '.container', '.image', '.kube', '.network', '.pod', '.volume', '.quadlets', '.qdl-bundle', '.zip'];

    /**
     * The accept option of the drop zone: it limits the browser file picker and refuses other
     * dropped files. check() still runs on every accepted file.
     *
     * @type {Record<string, string[]>}
     */
    static ACCEPT = {
        'application/octet-stream': ['.container', '.volume', '.network', '.image'],
        'application/zip': ['.zip']
    };

    /**
     * Returns the extension of a name, with its dot, or an empty string when it has none.
     *
     * @param {string} name File name.
     * @returns {string} The extension, for example ".container".
     */
    static extension(name) {
        const dot = name.lastIndexOf('.');
        return dot > 0 ? name.slice(dot) : '';
    }

    /**
     * Checks one file name like quadlet-drop does, in the same order.
     *
     * @param {string} name File name, without a folder.
     * @returns {DropNameProblem} null when accepted, else NO_NAME, BAD_PATH, HIDDEN, BAD_EXTENSION or BAD_NAME.
     */
    static check(name) {
        if (typeof name !== 'string' || name === '') { return 'NO_NAME' }
        if (name.includes('/') || name.includes('\\')) { return 'BAD_PATH' }
        if (name.startsWith('.')) { return 'HIDDEN' }
        const extension = DropFileRules.extension(name);
        if (!DropFileRules.EXTENSIONS.includes(extension)) { return 'BAD_EXTENSION' }
        const base = name.slice(0, -extension.length);
        if (!/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(base)) { return 'BAD_NAME' }
        if (DropFileRules.RESERVED_ENDINGS.some(ending => base.endsWith(ending))) { return 'BAD_NAME' }
        return null;
    }

    /**
     * Checks the size of one file.
     *
     * @param {number} bytes File size in bytes.
     * @returns {DropSizeProblem} null when accepted, else EMPTY or TOO_LARGE.
     */
    static checkSize(bytes) {
        if (!(bytes > 0)) { return 'EMPTY' }
        if (bytes > DropFileRules.MAX_BYTES) { return 'TOO_LARGE' }
        return null;
    }

    /**
     * Encodes bytes as standard base64 with padding and no line breaks, as quadlet-drop expects.
     * Any byte value works, so a binary .zip is safe.
     *
     * @param {Uint8Array} bytes The file content.
     * @returns {string} The base64 text.
     */
    static toBase64(bytes) {
        let binary = '';
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
        }
        return btoa(binary);
    }
}
