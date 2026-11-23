/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Auto refresh state of the header toggle: whether polling may run on the current page, since when,
 * and the functions that turn it on (with a fresh countdown) or off, or hold the countdown.
 *
 * @file AutoRefreshContext.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {createContext, useContext} from 'react';

/** @typedef {import('../types/module.js').AutoRefreshState} AutoRefreshState */

/**
 * Does nothing; the start, stop and hold of the default value, outside MainBoard or on a page
 * without auto refresh.
 */
function keepAsIs() {}

/**
 * Auto refresh that is always on: the default value, so polling works as before outside
 * MainBoard and on a page without the autoRefresh flag.
 *
 * @type {AutoRefreshState}
 */
export const AUTO_REFRESH_ALWAYS_ON = {on: true, ranOut: false, startedAt: null, start: keepAsIs, stop: keepAsIs, hold: keepAsIs};

/**
 * The auto refresh state from MainBoard. useAction runs its poll chain only while on is true.
 *
 * @type {import('react').Context<AutoRefreshState>}
 */
export const AutoRefreshContext = createContext(AUTO_REFRESH_ALWAYS_ON);

/**
 * Reads the auto refresh state of the current page.
 *
 * @returns {AutoRefreshState} The state and its start and stop functions.
 */
export function useAutoRefresh() {
    return useContext(AutoRefreshContext);
}
