/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Containers page: gathers hook state and asks ContainersModule to render it.
 *
 * @file ContainersPage.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

// noinspection ES6UnusedImports
import React from 'react';

import {useModulePage} from '../../hooks/useModulePage.js';
import {useContainerCommands} from '../../hooks/useContainerCommands.js';

import {containersModule} from './ContainersModule.jsx';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */
/** @typedef {import('../../types/container.js').ContainersPageState} ContainersPageState */

/**
 * Shows the Podman containers as resource cards, with a text filter and a source switch. Needs admin access.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @returns {React.ReactElement} The page content.
 */
export function ContainersPage(props) {
    /** @type {ContainersPageState} */
    const state = {...useModulePage(containersModule, props), ...useContainerCommands()};
    return containersModule.render(state);
}
