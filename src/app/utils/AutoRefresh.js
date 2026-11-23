/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Countdown rule of the header auto refresh: how long it stays on after a (re)start, and how
 * much of that time is left (0 when it has run out).
 *
 * @file AutoRefresh.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * Countdown rule of the header auto refresh.
 */
export class AutoRefresh {
    /**
     * How long auto refresh stays on after it was turned on or restarted, in ms (4 minutes).
     *
     * @type {number}
     */
    static OFF_AFTER_MS = 4 * 60 * 1000;

    /**
     * How long auto refresh stays on after it was turned on or restarted, in whole minutes,
     * for the tooltip.
     *
     * @returns {number} The minutes.
     */
    static offAfterMinutes() {
        return Math.round(AutoRefresh.OFF_AFTER_MS / 60000);
    }

    /**
     * Returns the time left until auto refresh turns itself off.
     *
     * @param {number} startedAt Time of the last (re)start, in ms since the epoch.
     * @param {number} now The time now, in ms since the epoch.
     * @returns {number} The ms left, never below 0, and never above OFF_AFTER_MS when the clock went back.
     */
    static msLeft(startedAt, now) {
        const left = startedAt + AutoRefresh.OFF_AFTER_MS - now;
        return Math.min(AutoRefresh.OFF_AFTER_MS, Math.max(0, left));
    }
}
