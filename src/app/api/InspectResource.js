/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Calls to the PodShift inspect action: the podman inspect object of one resource, and its
 * download through a temporary file (file mode) and a cockpit-ws external channel.
 *
 * @file InspectResource.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import cockpit from '../utils/cockpitTyped.js';
import {ChannelDownload} from '../utils/ChannelDownload.js';

import {PodShiftApi} from './PodShiftApi.js';

/** @typedef {import('../types/api.js').ApiError} ApiError */
/** @typedef {import('../types/inspect.js').InspectFile} InspectFile */
/** @typedef {import('../types/inspect.js').InspectKind} InspectKind */
/** @typedef {import('../types/inspect.js').InspectResult} InspectResult */

/**
 * Inspect action calls and file-mode download of one podman inspect object.
 * All members are static; this class is not constructed.
 */
export class InspectResource {
    /**
     * Paths the handler may name in file mode: a private file in a user runtime directory.
     *
     * @type {RegExp}
     */
    static #INSPECT_FILE_PATH = /^\/run\/user\/[0-9]+\/podshift\/inspect-[A-Za-z0-9]+\.json$/;

    /**
     * Delay before a downloaded file is removed. cockpit-ws opens the file when the download
     * request arrives, so a later removal does not cut it; the handler also removes files older
     * than 10 minutes.
     *
     * @type {number}
     */
    static #INSPECT_FILE_REMOVE_DELAY_MS = 10000;

    /**
     * Builds an Error that carries an API error code.
     *
     * @param {string} code Error code, for example 'NOT_FOUND'.
     * @param {string} message Error text.
     * @returns {ApiError} The error.
     */
    static #inspectError(code, message) {
        const err = /** @type {ApiError} */ (new Error(message));
        err.code = code;
        return err;
    }

    /**
     * Reads the inspect result of one container, image, volume, network or secret.
     *
     * @param {InspectKind} kind Resource kind.
     * @param {string} ref Name or ID of the resource.
     * @returns {Promise<InspectResult>} The result: the object, found false, or tooLarge with its size.
     * @throws {ApiError} When the call fails.
     */
    static async inspectResource(kind, ref) {
        return await PodShiftApi.callAction('inspect', {kind, ref});
    }

    /**
     * Has the handler write the inspect object as pretty JSON to a temporary file (file mode).
     * The file belongs to the podshift user, mode 0600.
     *
     * @param {InspectKind} kind Resource kind.
     * @param {string} ref Name or ID of the resource.
     * @returns {Promise<InspectFile>} Path and size of the file.
     * @throws {ApiError} When the call fails, with code NOT_FOUND when podman has no such resource.
     */
    static async writeInspectFile(kind, ref) {
        const result = await PodShiftApi.callAction('inspect', {kind, ref, mode: 'file'});
        if (!result.found) { throw InspectResource.#inspectError('NOT_FOUND', 'Not found') }
        const file = result.file;
        if (!file || typeof file.path !== 'string' || !InspectResource.#INSPECT_FILE_PATH.test(file.path)) { throw InspectResource.#inspectError('BAD_PATH', 'Unexpected inspect file path') }
        return file;
    }

    /**
     * Removes a temporary inspect file as root, like the handler runs. Failures are only logged.
     *
     * @param {string} path Path from writeInspectFile.
     * @returns {Promise<void>} Resolves when done.
     */
    static async removeInspectFile(path) {
        if (!InspectResource.#INSPECT_FILE_PATH.test(path)) { return }
        const handle = cockpit.file(path, {superuser: 'require'});
        try {
            await handle.replace(null);
        } catch (err) {
            console.warn('Failed to remove the inspect file', err);
        } finally {
            handle.close();
        }
    }

    /**
     * Downloads the inspect object of one resource as a JSON file. The handler writes it in file
     * mode; the browser then fetches it through a cockpit-ws external channel (fsread1) that runs
     * as root (superuser 'require') on the same host, the same user context as the handler, so the
     * podshift user's 0600 file stays private. The file is removed shortly after the download starts.
     *
     * @param {InspectKind} kind Resource kind.
     * @param {string} ref Name or ID of the resource.
     * @param {string} fileName Suggested file name, for example from inspectFileName.
     * @returns {Promise<InspectFile>} The file that was offered.
     * @throws {ApiError} When file mode fails, with code NOT_FOUND when podman has no such resource.
     */
    static async downloadInspect(kind, ref, fileName) {
        const file = await InspectResource.writeInspectFile(kind, ref);
        ChannelDownload.downloadFile(file.path, fileName, 'application/json');
        window.setTimeout(() => { InspectResource.removeInspectFile(file.path) }, InspectResource.#INSPECT_FILE_REMOVE_DELAY_MS);
        return file;
    }
}
