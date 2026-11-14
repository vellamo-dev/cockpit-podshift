/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Refresh counter that tells hooks to reload their data.
 *
 * @file RefreshContext.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {createContext, useContext} from 'react';

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
