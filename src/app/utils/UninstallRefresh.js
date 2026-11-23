/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Poll schedule of a tab with Uninstall while its auto refresh is on: fast for 2 minutes after
 * an Uninstall was queued, otherwise a slow delay for auto refresh turned on by hand.
 *
 * @file UninstallRefresh.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * Poll schedule of the Containers, Volumes, Networks and Quadlets tabs.
 */
export class UninstallRefresh {
    /**
     * How long auto refresh stays on after an Uninstall was queued, at most, in ms (2 minutes).
     *
     * @type {number}
     */
    static FOR_MS = 2 * 60 * 1000;

    /**
     * Poll delays after an Uninstall was queued: each step lasts until untilMs after the queue.
     *
     * @type {{untilMs: number, delayMs: number}[]}
     */
    static STEPS = [
        {untilMs: 15000, delayMs: 1000},
        {untilMs: 30000, delayMs: 2000},
        {untilMs: 2 * 60 * 1000, delayMs: 5000}
    ];

    /**
     * Poll delay while auto refresh was turned on by hand, or after the Uninstall steps, in ms.
     *
     * @type {number}
     */
    static MANUAL_MS = 10000;

    /**
     * Returns the poll delay of the list.
     *
     * @param {boolean} on True while auto refresh is on; false or a tab without the toggle gives 0.
     * @param {number} msSinceUninstall Milliseconds since the last queued Uninstall, or NaN for none.
     * @returns {number} The delay in ms, or 0 for no polling.
     */
    static pollDelay(on, msSinceUninstall) {
        if (!on) { return 0 }
        if (!(msSinceUninstall >= 0)) { return UninstallRefresh.MANUAL_MS }
        const step = UninstallRefresh.STEPS.find(item => msSinceUninstall < item.untilMs);
        return step ? step.delayMs : UninstallRefresh.MANUAL_MS;
    }
}
