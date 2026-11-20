/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared health-check result for the Overview Health card and the Health tab.
 *
 * @file HealthContext.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';

import {PodShiftApi} from '../api/PodShiftApi.js';
import {useRefreshToken, useReportRefreshing} from './RefreshContext.js';
import {createInFlight} from '../utils/inFlight.js';

/** @typedef {import('../types/health.js').HealthCheckState} HealthCheckState */
/** @typedef {import('../types/health.js').HealthResult} HealthResult */

/**
 * Context that holds the shared health-check state; null outside HealthProvider.
 *
 * @type {React.Context<HealthCheckState|null>}
 */
const HealthContext = createContext(null);

/**
 * Provides the shared health-check result to the Overview Health card and the Health tab.
 * The check runs once, then again when the header refresh button is used.
 * refreshing is true while a check runs, also when a result is already on screen.
 *
 * @param {object} props Component props.
 * @param {React.ReactNode} props.children Components that use the health check.
 * @returns {React.ReactElement} The context provider.
 */
export function HealthProvider({children}) {
    const token = useRefreshToken();
    const [data, setData] = useState(/** @type {HealthResult|null} */ (null));
    const [error, setError] = useState(/** @type {Error|null} */ (null));
    const [loading, setLoading] = useState(false);
    const seqRef = useRef(0);
    const attemptedToken = useRef(null);
    const dataRef = useRef(data);
    const [refreshing, setRefreshing] = useState(false);
    const loads = useRef(/** @type {import('../utils/inFlight.js').InFlight|null} */ (null));
    if (loads.current == null) { loads.current = createInFlight(setRefreshing) }

    dataRef.current = data;

    const load = useCallback(async () => {
        const seq = ++seqRef.current;
        loads.current.begin();
        try {
            const payload = await PodShiftApi.callAction('health-check');
            if (seq !== seqRef.current) { return }
            setData(payload);
            setError(null);
        } catch (e) {
            if (seq !== seqRef.current) { return }
            setError(e);
        } finally {
            if (seq === seqRef.current) { setLoading(false) }
            loads.current.end();
        }
    }, []);

    const ensure = useCallback(() => {
        if (attemptedToken.current === token) { return }
        attemptedToken.current = token;
        if (dataRef.current == null) { setLoading(true) }
        load();
    }, [token, load]);

    const value = useMemo(() => ({data, error, loading, refreshing, ensure}), [data, error, loading, refreshing, ensure]);

    return (
        <HealthContext.Provider value={value}>
            {children}
        </HealthContext.Provider>
    );
}

/**
 * Loads the shared health-check when enabled. A later mount with the same
 * refresh token reuses the cached result and does not call the handler again.
 * While enabled, a running check is reported to MainBoard for the header refresh button.
 *
 * @param {boolean} [enabled] False skips the load, for example without admin access.
 * @returns {HealthCheckState} The result, the last error, and the loading and refreshing flags.
 */
export function useHealthCheck(enabled = true) {
    const ctx = useContext(HealthContext);
    const token = useRefreshToken();

    useEffect(() => {
        if (enabled) { ctx.ensure() }
    }, [enabled, token, ctx]);

    useReportRefreshing(enabled && ctx.refreshing);

    return {data: ctx.data, error: ctx.error, loading: ctx.loading, refreshing: ctx.refreshing};
}
