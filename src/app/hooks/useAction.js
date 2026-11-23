/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Hook that loads one handler action, once or on a poll delay.
 *
 * @file useAction.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {useCallback, useEffect, useRef, useState} from 'react';

import {i18n} from '../utils/i18n.js';

import {PodShiftApi} from '../api/PodShiftApi.js';
import {useAutoRefresh} from './AutoRefreshContext.js';
import {useRefreshToken, useReportRefreshing} from './RefreshContext.js';
import {createInFlight} from '../utils/inFlight.js';

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
 * Loads one handler action. poll is a delay in ms between the end of one load and the
 * next, or 0 for a single load. It can also be a function that returns the next delay
 * each time, or 0 to stop; a new function starts a new poll chain. Polling pauses while
 * the page is hidden, loads again when it is shown, and never overlaps another load. It also
 * pauses while the header auto refresh is off, and loads again (unless a load already runs)
 * when it comes back on. Single loads, on mount and on a header refresh, always run.
 * A load whose data equals the data on screen keeps the old data, so nothing re-renders.
 * Last good rows and data stay on screen while a later load runs or fails.
 * refreshing is true while any load runs, also with data on screen. Loads other than
 * poll ticks are reported to MainBoard, so the header refresh button shows progress.
 *
 * @template {keyof ActionDataMap} A
 * @param {A} action Action name, for example 'overview-info'.
 * @param {ActionOptions} [options] Poll delay and enabled flag.
 * @returns {ActionState<ActionDataMap[A]>} Rows, data, last error, loading and refreshing flags, and a refresh function.
 */
export function useAction(action, {poll = 0, enabled = true} = {}) {
    const token = useRefreshToken();
    const autoOn = useAutoRefresh().on;
    const resume = useRef(false);
    const [rows, setRows] = useState(/** @type {PropertyRow[]|null} */ (null));
    const [data, setData] = useState(/** @type {ActionDataMap[A]|null} */ (null));
    const [error, setError] = useState(/** @type {Error|null} */ (null));
    const [loading, setLoading] = useState(enabled);
    const rowsRef = useRef(rows);
    const dataRef = useRef(data);
    const seqRef = useRef(0);
    const [refreshing, setRefreshing] = useState(false);
    const [reported, setReported] = useState(false);
    const allLoads = useRef(/** @type {import('../utils/inFlight.js').InFlight|null} */ (null));
    const shownLoads = useRef(/** @type {import('../utils/inFlight.js').InFlight|null} */ (null));
    if (allLoads.current == null) { allLoads.current = createInFlight(setRefreshing) }
    if (shownLoads.current == null) { shownLoads.current = createInFlight(setReported) }

    useReportRefreshing(reported);

    rowsRef.current = rows;
    dataRef.current = data;

    const load = useCallback(async (background = false) => {
        if (!enabled) { return }
        const seq = ++seqRef.current;
        const shown = background !== true;
        allLoads.current.begin();
        if (shown) { shownLoads.current.begin() }
        try {
            const payload = await PodShiftApi.callAction(action);
            if (seq !== seqRef.current) { return }
            setError(null);
            if (JSON.stringify(payload) === JSON.stringify(dataRef.current)) { return }
            setData(payload);
            const rawRows = /** @type {{ rows?: PropertyRow[] }} */ (payload).rows;
            setRows(Array.isArray(rawRows) ? mapRows(rawRows) : null);
        } catch (e) {
            if (seq !== seqRef.current) { return }
            setError(e);
        } finally {
            if (seq === seqRef.current) { setLoading(false) }
            allLoads.current.end();
            if (shown) { shownLoads.current.end() }
        }
    }, [action, enabled]);

    const refresh = useCallback(() => load(), [load]);

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
        if (!autoOn) {
            resume.current = true;
            return undefined;
        }

        let timer;
        let run = 0;

        /**
         * Stops the poll timer, if it runs, and ends the current poll chain.
         */
        function stop() {
            run += 1;
            if (timer !== undefined) {
                window.clearTimeout(timer);
                timer = undefined;
            }
        }

        /**
         * Waits the next poll delay, then loads in the background and waits again. A tick
         * is skipped while another load still runs, so loads never overlap.
         *
         * @param {number} chain Poll chain this timer belongs to; a stopped chain ends.
         */
        function schedule(chain) {
            const delay = typeof poll === 'function' ? poll() : poll;
            if (chain !== run || !delay) { return }
            timer = window.setTimeout(() => {
                timer = undefined;
                if (allLoads.current.count() > 0) {
                    schedule(chain);
                    return;
                }
                load(true).then(() => schedule(chain), () => schedule(chain));
            }, delay);
        }

        /**
         * Stops polling while the page is hidden; loads and polls again when it is shown.
         */
        function onVisibility() {
            stop();
            if (document.hidden) { return }
            const chain = run;
            load(true).then(() => schedule(chain), () => schedule(chain));
        }

        /**
         * Starts the chain: when auto refresh has just come back on, loads in the background
         * first, unless a load already runs (a header refresh starts one at the same time).
         */
        function begin() {
            const chain = run;
            const reload = resume.current && allLoads.current.count() === 0;
            resume.current = false;
            if (!reload) {
                schedule(chain);
                return;
            }
            load(true).then(() => schedule(chain), () => schedule(chain));
        }

        if (!document.hidden) { begin() }

        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            stop();
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [enabled, load, poll, autoOn]);

    return {rows, data, error, loading, refreshing, refresh};
}
