/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Hook that loads one handler action, once or on a poll period.
 *
 * @file useAction.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {useCallback, useEffect, useRef, useState} from 'react';

import {i18n} from '../utils/i18n.js';

import {PodShiftApi} from '../api/PodShiftApi.js';
import {useRefreshToken} from './RefreshContext.js';

/** @typedef {import('../types/card.js').PropertyRow} PropertyRow */
/** @typedef {import('../types/api.js').ActionOptions} ActionOptions */
/** @typedef {import('../types/api.js').ActionState} ActionState */
/** @typedef {import('../types/api.js').ActionDataMap} ActionDataMap */

/**
 * Translates the row labels and replaces missing values with "Not set".
 *
 * @param {PropertyRow[]} [rows] Rows from the handler.
 * @returns {PropertyRow[]} The translated rows.
 */
function mapRows(rows) {
    return (rows || []).map(row => ({
        id: row.id,
        label: i18n(row.label),
        value: row.value == null ? i18n("Not set") : row.value,
        unit: row.unit,
        scope: row.scope
    }));
}

/**
 * Loads one handler action. poll is a period in ms, or 0 for a single load.
 * Last good rows and data stay on screen while a later load runs or fails.
 *
 * @template {keyof ActionDataMap} A
 * @param {A} action Action name, for example 'overview-info'.
 * @param {ActionOptions} [options] Poll period and enabled flag.
 * @returns {ActionState<ActionDataMap[A]>} Rows, data, last error, loading flag and a refresh function.
 */
export function useAction(action, {poll = 0, enabled = true} = {}) {
    const token = useRefreshToken();
    const [rows, setRows] = useState(/** @type {PropertyRow[]|null} */ (null));
    const [data, setData] = useState(/** @type {ActionDataMap[A]|null} */ (null));
    const [error, setError] = useState(/** @type {Error|null} */ (null));
    const [loading, setLoading] = useState(enabled);
    const rowsRef = useRef(rows);
    const dataRef = useRef(data);
    const seqRef = useRef(0);

    rowsRef.current = rows;
    dataRef.current = data;

    const load = useCallback(async () => {
        if (!enabled) { return }
        const seq = ++seqRef.current;
        try {
            const payload = await PodShiftApi.callAction(action);
            if (seq !== seqRef.current) { return }
            setData(payload);
            const rawRows = /** @type {{ rows?: PropertyRow[] }} */ (payload).rows;
            setRows(Array.isArray(rawRows) ? mapRows(rawRows) : null);
            setError(null);
        } catch (e) {
            if (seq !== seqRef.current) { return }
            setError(e);
        } finally {
            if (seq === seqRef.current) { setLoading(false) }
        }
    }, [action, enabled]);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return undefined;
        }
        if (rowsRef.current == null && dataRef.current == null) { setLoading(true) }
        load().catch(() => {});
        return undefined;
    }, [enabled, load, token]);

    useEffect(() => {
        if (!enabled || !poll) { return undefined }

        let timer;

        /**
         * Stops the poll timer, if it runs.
         */
        function stop() {
            if (timer !== undefined) {
                window.clearInterval(timer);
                timer = undefined;
            }
        }

        /**
         * Starts the poll timer; each tick loads when the page is visible.
         */
        function start() {
            stop();
            timer = window.setInterval(() => {
                if (document.visibilityState === 'visible') { load().catch(() => {}) }
            }, poll);
        }

        /**
         * Stops polling while the page is hidden; loads and polls again when it is shown.
         */
        function onVisibility() {
            if (document.visibilityState === 'hidden') {
                stop();
            } else {
                load().catch(() => {});
                start();
            }
        }

        if (document.visibilityState === 'visible') { start() }

        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            stop();
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [enabled, load, poll]);

    return {rows, data, error, loading, refresh: load};
}
