/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Secrets page: gathers hook state and asks SecretsModule to render it.
 *
 * @file SecretsPage.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

// noinspection ES6UnusedImports
import React from 'react';

import {useModulePage} from '../../hooks/useModulePage.js';

import {secretsModule} from './SecretsModule.jsx';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */

/**
 * Shows Podman secrets as resource cards, with a text filter and a usage switch. Needs admin access.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @returns {React.ReactElement} The page content.
 */
export function SecretsPage(props) {
    const state = useModulePage(secretsModule, props);
    return secretsModule.render(state);
}
