/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Images page: gathers hook state and asks ImagesModule to render it.
 *
 * @file ImagesPage.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

// noinspection ES6UnusedImports
import React from 'react';

import {useModulePage} from '../../hooks/useModulePage.js';

import {imagesModule} from './ImagesModule.jsx';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */

/**
 * Shows the podman images as resource cards, with a text filter and a source switch. Needs admin access.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @returns {React.ReactElement} The page content.
 */
export function ImagesPage(props) {
    const state = useModulePage(imagesModule, props);
    return imagesModule.render(state);
}
