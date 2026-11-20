/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Refresh counter that tells hooks to reload their data, and the report of running loads
 * that lets the header refresh button show progress.
 *
 * @file RefreshContext.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {createContext, useContext, useEffect} from 'react';

/**
 * A counter from MainBoard. Hooks watch it and reload when it changes.
 *
 * @type {import('react').Context<number>}
 */
export const RefreshContext = createContext(0);

/**
 * Reads the refresh counter of the main page.
 *
 * @returns {number} The counter; it goes up on each refresh.
 */
export function useRefreshToken() {
    return useContext(RefreshContext);
}

/**
 * Report function from MainBoard: a call marks one load of the visible tab as running and
 * returns a function that marks it as finished. Null outside MainBoard.
 *
 * @type {import('react').Context<(() => () => void)|null>}
 */
export const RefreshActivityContext = createContext(null);

/**
 * Tells MainBoard that this component has a load running, while busy is true and the
 * component is mounted. The header refresh button shows progress while any report is open.
 *
 * @param {boolean} busy True while a load of this component runs.
 */
export function useReportRefreshing(busy) {
    const report = useContext(RefreshActivityContext);

    useEffect(() => {
        if (!report || !busy) { return undefined }
        return report();
    }, [report, busy]);
}
