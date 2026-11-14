/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* global __PODSHIFT_UI_VERSION__ */

/**
 * Build-time facts about the Cockpit app, injected by build.js.
 *
 * @file AppInfo.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * Build-time facts about the Cockpit app. All members are static; this class is not constructed.
 */
export class AppInfo {
    /**
     * UI version. build.js injects it from the Version: line of cockpit-podshift.spec.
     *
     * @type {string}
     */
    static VERSION = __PODSHIFT_UI_VERSION__;
}
