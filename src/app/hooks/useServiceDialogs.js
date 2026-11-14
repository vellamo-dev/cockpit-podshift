/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Hook that keeps the open status and log views of the Services page.
 *
 * @file useServiceDialogs.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {useState} from 'react';

/** @typedef {import('../types/service.js').ServiceItem} ServiceItem */
/** @typedef {import('../types/service.js').ServiceDialogsState} ServiceDialogsState */

/**
 * Keeps one open status view and one open log view, each the service it shows or null.
 * ServicesPage merges the result into its module page state.
 *
 * @returns {ServiceDialogsState} The open services and their setters.
 */
export function useServiceDialogs() {
    const [statusService, setStatusService] = useState(/** @type {ServiceItem|null} */ (null));
    const [logService, setLogService] = useState(/** @type {ServiceItem|null} */ (null));
    return {statusService, setStatusService, logService, setLogService};
}
