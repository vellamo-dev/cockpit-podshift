/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Copyright (C) 2017 Red Hat, Inc.
 */

/**
 * Entry point: loads the styles and mounts the application into the page.
 *
 * @file index.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {createRoot} from 'react-dom/client';

import "cockpit-dark-theme";

import cockpit from './utils/cockpitTyped.js';
import {Application} from './app.jsx';

import "patternfly/patternfly-6-cockpit.scss";
import './app.scss';

/**
 * Loads Cockpit's user and system info, then mounts the application.
 *
 * @returns {Promise<void>} Resolves once the application is rendered.
 */
async function main() {
    await cockpit.init();
    createRoot(document.getElementById("app")).render(<Application/>);
}

document.addEventListener("DOMContentLoaded", main);
