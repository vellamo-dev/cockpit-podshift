/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Services page: gathers hook state, including the status and log views, and asks
 * ServicesModule to render it.
 *
 * @file ServicesPage.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

// noinspection ES6UnusedImports
import React from 'react';

import {useModulePage} from '../../hooks/useModulePage.js';
import {useServiceDialogs} from '../../hooks/useServiceDialogs.js';

import {servicesModule} from './ServicesModule.jsx';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */
/** @typedef {import('../../types/service.js').ServicesPageState} ServicesPageState */

/**
 * Shows the systemd user services of the podshift user as resource cards, with a text
 * filter and a state switch. Needs admin access.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @returns {React.ReactElement} The page content.
 */
export function ServicesPage(props) {
    /** @type {ServicesPageState} */
    const state = {...useModulePage(servicesModule, props), ...useServiceDialogs()};
    return servicesModule.render(state);
}
