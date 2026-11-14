/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Calls to the PodShift Cockpit handler and the access checks around it.
 *
 * @file PodShiftApi.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import cockpit from '../utils/cockpitTyped.js';
import {superuser} from 'superuser';

/** @typedef {import('../types/api.js').AccessResult} AccessResult */
/** @typedef {import('../types/api.js').ApiError} ApiError */
/** @typedef {import('../types/api.js').ActionDataMap} ActionDataMap */

/**
 * Access checks and handler calls for the PodShift Cockpit API.
 * All members are static; this class is not constructed.
 */
export class PodShiftApi {
    /**
     * Path of the PodShift Cockpit handler script.
     *
     * @type {string}
     */
    static HANDLER = '/opt/podshift/cockpit/api/main.sh';

    /**
     * Waits until Cockpit knows whether admin access is on (allowed is null while starting).
     *
     * @returns {Promise<boolean>} True when admin access is on.
     */
    static #adminState() {
        if (superuser.allowed !== null) { return Promise.resolve(superuser.allowed) }
        return new Promise(resolve => {
            /**
             * Resolves the promise once superuser.allowed is known.
             */
            function onChange() {
                if (superuser.allowed === null) { return }
                superuser.removeEventListener('changed', onChange);
                resolve(superuser.allowed);
            }
            superuser.addEventListener('changed', onChange);
        });
    }

    /**
     * Checks whether the PodShift handler is installed on the system.
     *
     * @returns {Promise<boolean>} True when the handler file exists.
     */
    static async handlerExists() {
        try {
            await cockpit.spawn(['test', '-f', PodShiftApi.HANDLER]);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Checks whether Cockpit administrative access is on.
     *
     * @returns {Promise<boolean>} True when admin access is on.
     */
    static async isAdmin() {
        return await PodShiftApi.#adminState() === true;
    }

    /**
     * Checks whether the logged-in user is the podshift system user.
     *
     * @returns {Promise<boolean>} True when the user name and UID match the podshift user.
     */
    static async isPodshiftUser() {
        try {
            const user = cockpit.info.user;
            if (user.name !== 'podshift') { return false }
            const output = await cockpit.spawn(['id', '-u', 'podshift']);
            return String(user.uid) === output.trim();
        } catch (e) {
            return false;
        }
    }

    /**
     * Picks the page to show from the install and access checks.
     * 'checking' is the UI state before this resolves.
     *
     * @returns {Promise<AccessResult>} The page to show, and the access mode for the main board.
     */
    static async resolveAccess() {
        if (!await PodShiftApi.handlerExists()) { return {status: 'not-installed'} }
        if (await PodShiftApi.isAdmin()) { return {status: 'mainboard', mode: 'admin'} }
        if (await PodShiftApi.isPodshiftUser()) { return {status: 'mainboard', mode: 'podshift'} }
        return {status: 'no-access'};
    }

    /**
     * Calls back whenever Cockpit administrative access changes.
     *
     * @param {() => void} callback Called on each change.
     * @returns {() => void} Stops the calls.
     */
    static onSuperuserChanged(callback) {
        superuser.addEventListener('changed', callback);
        return () => superuser.removeEventListener('changed', callback);
    }

    /**
     * Builds an Error that carries an API error code.
     *
     * @param {string} code Error code, for example 'PARSE_ERROR'.
     * @param {string} message Error text.
     * @returns {ApiError} The error.
     */
    static #apiError(code, message) {
        const err = /** @type {ApiError} */ (new Error(message));
        err.code = code;
        return err;
    }

    /**
     * Runs one handler action as root and returns the envelope's data on success.
     *
     * @template {keyof ActionDataMap} A
     * @param {A} action Action name, for example 'overview-info'.
     * @param {object} [args] Action arguments, sent as JSON.
     * @returns {Promise<ActionDataMap[A]>} The data of the response envelope.
     * @throws {ApiError} When the call fails or the response is not ok.
     */
    static async callAction(action, args = {}) {
        const request = {apiVersion: 1, action, args};
        let output;
        try {
            output = await cockpit.spawn([PodShiftApi.HANDLER], {
                superuser: 'require',
                err: 'message'
            }).input(JSON.stringify(request));
        } catch (e) {
            throw PodShiftApi.#apiError(e.problem || 'SPAWN_FAILED', e.message || String(e));
        }

        let envelope;
        try {
            envelope = JSON.parse(output);
        } catch (e) {
            throw PodShiftApi.#apiError('PARSE_ERROR', 'Invalid response from PodShift API');
        }

        const status = envelope?.status;
        if (!status || status.ok !== true) { throw PodShiftApi.#apiError(status?.code || 'ERROR', status?.message || 'Action failed') }

        return /** @type {ActionDataMap[A]} */ (envelope.data || {});
    }
}
