/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Root component that shows the page matching the user's access.
 *
 * @file app.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useEffect, useState} from 'react';

import {PodShiftApi} from './api/PodShiftApi.js';
import {Loading} from './components/status/Loading.jsx';
import {NoAccess} from './components/status/NoAccess.jsx';
import {NotInstalled} from './components/status/NotInstalled.jsx';
import {MainBoard} from './components/layout/MainBoard.jsx';

/** @typedef {import('./types/api.js').AccessResult} AccessResult */

/**
 * Checks access on start and on each admin access change, then shows the matching page.
 *
 * @returns {React.ReactElement} The loading, not-installed, no-access or main page.
 */
export function Application() {
    const [access, setAccess] = useState(/** @type {AccessResult} */ ({status: 'checking'}));

    useEffect(() => {
        let cancelled = false;

        /**
         * Runs the access check and stores the result unless the component is gone.
         */
        function refresh() {
            PodShiftApi.resolveAccess().then(result => {
                if (!cancelled) { setAccess(result) }
            });
        }

        refresh();
        const stop = PodShiftApi.onSuperuserChanged(refresh);
        return () => {
            cancelled = true;
            stop();
        };
    }, []);

    switch (access.status) {
    case 'not-installed':
        return <NotInstalled/>;
    case 'no-access':
        return <NoAccess/>;
    case 'mainboard':
        return <MainBoard mode={access.mode}/>;
    default:
        return <Loading/>;
    }
}
