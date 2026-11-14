/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Hook that keeps the selected tab in the page address.
 *
 * @file useTab.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {useEffect, useState} from 'react';

import cockpit from '../utils/cockpitTyped.js';

/**
 * Keeps the selected tab in the page address (#/containers), so a refresh keeps it.
 *
 * @param {string[]} tabIds Keys of all tabs.
 * @param {string} defaultId Tab shown when the address names no known tab.
 * @returns {[string, (id: string) => void]} The selected tab key, and a function that selects a tab.
 */
export function useTab(tabIds, defaultId) {
    /**
     * Reads the tab key from the page address.
     *
     * @returns {string} The tab key, or the default when the address names no known tab.
     */
    function read() {
        const id = cockpit.location.path[0];
        return tabIds.includes(id) ? id : defaultId;
    }
    const [tab, setTab] = useState(read);

    useEffect(() => {
        /**
         * Selects the tab named in the new page address.
         */
        function onChange() {
            setTab(read());
        }

        cockpit.addEventListener('locationchanged', onChange);
        return () => cockpit.removeEventListener('locationchanged', onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Selects a tab by writing its key into the page address.
     *
     * @param {string} id Tab key.
     */
    function go(id) {
        cockpit.location.go([id]);
    }

    return [tab, go];
}
