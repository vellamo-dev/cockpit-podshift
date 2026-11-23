/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Display order of the install log: newest or oldest line first, kept in the browser.
 * This is the first browser storage the project uses: one localStorage key, so the choice
 * stays after a reload. It is per browser and Cockpit address, not per Cockpit user.
 *
 * @file LogOrder.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/** @typedef {'newest'|'oldest'} LogOrderValue */

/**
 * Reads, stores and applies the install log order.
 */
export class LogOrder {
    /**
     * localStorage key of the order.
     *
     * @type {string}
     */
    static KEY = 'podshift.installLog.order';

    /**
     * Order used when nothing valid is stored.
     *
     * @type {LogOrderValue}
     */
    static DEFAULT = 'newest';

    /**
     * Reads the stored order. A missing or unknown value, or storage that cannot be used
     * (private mode, disabled), gives the default.
     *
     * @param {() => Storage} getStorage Returns the storage, for example () => window.localStorage.
     * @returns {LogOrderValue} The order.
     */
    static read(getStorage) {
        try {
            const value = getStorage().getItem(LogOrder.KEY);
            return value === 'oldest' || value === 'newest' ? value : LogOrder.DEFAULT;
        } catch {
            return LogOrder.DEFAULT;
        }
    }

    /**
     * Stores the order; storage that cannot be used is ignored.
     *
     * @param {() => Storage} getStorage Returns the storage.
     * @param {LogOrderValue} order The order.
     */
    static write(getStorage, order) {
        try {
            getStorage().setItem(LogOrder.KEY, order);
        } catch {
            // The choice then lasts until the page reloads.
        }
    }

    /**
     * Orders log entries that come oldest first, without changing the input.
     *
     * @template T
     * @param {T[]} entries The entries, oldest first.
     * @param {LogOrderValue} order The order to show.
     * @returns {T[]} The entries in that order.
     */
    static apply(entries, order) {
        return order === 'oldest' ? entries : entries.slice().reverse();
    }
}
