/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Networks page: gathers hook state and asks NetworksModule to render it.
 *
 * @file NetworksPage.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

// noinspection ES6UnusedImports
import React from 'react';

import {useModulePage} from '../../hooks/useModulePage.js';

import {networksModule} from './NetworksModule.jsx';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */

/**
 * Shows the podman networks as resource cards, with a text filter and a source switch. Needs admin access.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @returns {React.ReactElement} The page content.
 */
export function NetworksPage(props) {
    const state = useModulePage(networksModule, props);
    return networksModule.render(state);
}
