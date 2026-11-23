/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Remembers the Uninstall targets queued a short while ago, so their Uninstall item stays
 * disabled and the same removal cannot be queued twice while PodShift still runs it. The tab
 * loads its list right after the queue and again after 5 seconds, but stopping a unit can take
 * 10 seconds or more, so the item can still show then. The memory is shared by all tabs, as each
 * tab is unmounted while another one is open, and lasts until the page reloads.
 *
 * @file UninstallGuard.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * Queued Uninstall targets, by the name sent to quadlet-remove.
 */
export class UninstallGuard {
    /**
     * How long a queued target keeps its Uninstall item disabled, in ms.
     *
     * @type {number}
     */
    static HOLD_MS = 60000;

    /**
     * End time of each queued name, in ms since the epoch.
     *
     * @type {Map<string, number>}
     */
    static #until = new Map();

    /**
     * Remembers that the removal of a name was queued.
     *
     * @param {string} name The file or app name sent to quadlet-remove.
     * @param {number} now The current time in ms, for example Date.now().
     */
    static mark(name, now) {
        UninstallGuard.#until.set(name, now + UninstallGuard.HOLD_MS);
    }

    /**
     * Tells whether the removal of a name was queued less than HOLD_MS ago. An ended entry is forgotten.
     *
     * @param {string} name The file or app name sent to quadlet-remove.
     * @param {number} now The current time in ms.
     * @returns {boolean} True while the Uninstall item stays disabled.
     */
    static isQueued(name, now) {
        const until = UninstallGuard.#until.get(name);
        if (until === undefined) { return false }
        if (now < until) { return true }
        UninstallGuard.#until.delete(name);
        return false;
    }

    /**
     * Returns how long until the next entry ends, so the page can show the item again then.
     *
     * @param {number} now The current time in ms.
     * @returns {number|null} The wait in ms, or null when nothing is queued.
     */
    static msUntilNextEnd(now) {
        let next = null;
        for (const until of UninstallGuard.#until.values()) {
            if (until > now && (next === null || until < next)) { next = until }
        }
        return next === null ? null : next - now;
    }

    /**
     * Forgets every queued name, for the unit tests.
     */
    static clear() {
        UninstallGuard.#until.clear();
    }
}
