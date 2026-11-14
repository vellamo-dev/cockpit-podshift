/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Quadlets page: gathers hook state and asks QuadletsModule to render it.
 *
 * @file QuadletsPage.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

// noinspection ES6UnusedImports
import React from 'react';

import {useModulePage} from '../../hooks/useModulePage.js';

import {quadletsModule} from './QuadletsModule.jsx';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */

/**
 * Shows the podman Quadlets as resource cards, with a text filter and state and type switches.
 * Needs admin access.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @returns {React.ReactElement} The page content.
 */
export function QuadletsPage(props) {
    const state = useModulePage(quadletsModule, props);
    return quadletsModule.render(state);
}
