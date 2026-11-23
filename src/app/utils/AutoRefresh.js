/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Countdown rule of the header auto refresh: how long it stays on after a (re)start (4 minutes, or
 * a shorter time a page asks for, such as 2 minutes after an Uninstall), and how
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
     * @param {number} [forMs] How long it stays on, in ms; OFF_AFTER_MS when left out.
     * @returns {number} The minutes.
     */
    static offAfterMinutes(forMs = AutoRefresh.OFF_AFTER_MS) {
        return Math.round(forMs / 60000);
    }

    /**
     * Returns the time left until auto refresh turns itself off.
     *
     * @param {number} startedAt Time of the last (re)start, in ms since the epoch.
     * @param {number} now The time now, in ms since the epoch.
     * @param {number} [forMs] How long it stays on, in ms; OFF_AFTER_MS when left out.
     * @returns {number} The ms left, never below 0, and never above forMs when the clock went back.
     */
    static msLeft(startedAt, now, forMs = AutoRefresh.OFF_AFTER_MS) {
        const left = startedAt + forMs - now;
        return Math.min(forMs, Math.max(0, left));
    }
}
