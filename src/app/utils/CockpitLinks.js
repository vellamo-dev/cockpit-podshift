/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Links to Cockpit's own pages, and to the in-page Services tab.
 * System services link to the Services page. Units of the podshift user cannot:
 * Services reads the signed-in user's own user manager, so it cannot show them.
 * Those units open on our Services tab, with the search box set to the unit name,
 * or on the Logs page.
 *
 * @file CockpitLinks.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import cockpit from './cockpitTyped.js';

/**
 * Builds and opens addresses of Cockpit pages.
 */
export class CockpitLinks {
    /**
     * UID of the podshift user.
     *
     * @type {number}
     */
    static PODSHIFT_UID = 300;

    /**
     * Returns the Cockpit Services page address for a system unit.
     *
     * @param {string} unit Unit name, for example firewalld.service.
     * @returns {string} The address for cockpit.jump.
     */
    static serviceAddress(unit) {
        return '/system/services#/' + encodeURIComponent(unit);
    }

    /**
     * Opens Cockpit's Services page at a system unit.
     *
     * @param {string} unit Unit name.
     * @returns {void}
     */
    static openService(unit) {
        cockpit.jump(CockpitLinks.serviceAddress(unit));
    }

    /**
     * Opens the Services tab with the search box set to a unit name.
     *
     * @param {string} unit Unit name, for example podman.socket.
     * @returns {void}
     */
    static openServicesTab(unit) {
        cockpit.location.go(['services'], {filter: unit});
    }

    /**
     * Returns the Cockpit Logs page address for a user service. user-service matches
     * _SYSTEMD_USER_UNIT, COREDUMP_USER_UNIT and USER_UNIT (pkg/systemd/logsHelpers.js);
     * _UID adds the podshift user; priority=info shows Info and above instead of the
     * default Error and above. Without boot, the page shows the current boot.
     *
     * @param {string} unit Unit name, for example example-quadlet-container.service.
     * @returns {string} The address for cockpit.jump.
     */
    static serviceLogAddress(unit) {
        return '/system/logs#/?priority=info&user-service=' + encodeURIComponent(unit) + '&_UID=' + CockpitLinks.PODSHIFT_UID;
    }

    /**
     * Opens Cockpit's Logs page filtered to a user service of the podshift user.
     *
     * @param {string} unit Unit name.
     * @returns {void}
     */
    static openServiceLog(unit) {
        cockpit.jump(CockpitLinks.serviceLogAddress(unit));
    }
}
