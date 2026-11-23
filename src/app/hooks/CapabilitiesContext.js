/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Capabilities of the installed PodShift: which handler actions it offers, for the tab menu
 * and for features that need an optional action.
 *
 * @file CapabilitiesContext.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {createContext, useContext, useMemo} from 'react';

import {buildAvailableSet, hasCapability} from '../utils/capabilities.js';
import {useAction} from './useAction.js';

/** @typedef {import('../types/capabilities.js').CapabilitiesState} CapabilitiesState */

/**
 * Context with the capabilities state. Outside CapabilitiesProvider it stays loading, so nothing is hidden.
 *
 * @type {React.Context<CapabilitiesState>}
 */
const CapabilitiesContext = createContext(/** @type {CapabilitiesState} */ ({status: 'loading', available: null, error: null}));

/**
 * Loads the capabilities action once when mounted (MainBoard mounts again on each admin access
 * change) and again on the header refresh. A reload, failed or not, keeps the last good list until
 * the new one arrives, so the tabs do not change while it runs.
 *
 * @param {object} props Component props.
 * @param {React.ReactNode} props.children Components that use the capabilities.
 * @returns {React.ReactElement} The context provider.
 */
export function CapabilitiesProvider({children}) {
    const {data, error} = useAction('capabilities');

    const value = useMemo(() => {
        if (data != null) { return {status: 'ready', available: buildAvailableSet(data), error: null} }
        if (error != null) { return {status: 'error', available: null, error} }
        return {status: 'loading', available: null, error: null};
    }, [data, error]);

    return (
        <CapabilitiesContext.Provider value={/** @type {CapabilitiesState} */ (value)}>
            {children}
        </CapabilitiesContext.Provider>
    );
}

/**
 * Reads the capabilities state.
 *
 * @returns {CapabilitiesState} The state.
 */
export function useCapabilities() {
    return useContext(CapabilitiesContext);
}

/**
 * Tells whether an optional action can be used. True while the list loads or when it could not be read.
 *
 * @param {string} action Action name, for example 'inspect'.
 * @returns {boolean} True when the feature that needs it can be shown.
 */
export function useCapability(action) {
    return hasCapability(useContext(CapabilitiesContext), action);
}
