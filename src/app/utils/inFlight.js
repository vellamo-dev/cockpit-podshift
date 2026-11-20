/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Counter of running loads, so a hook can tell when any of its loads is still busy.
 *
 * @file inFlight.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * @typedef {object} InFlight
 * @property {() => void} begin Counts one more running load.
 * @property {() => void} end Counts one load as finished; extra calls are ignored.
 * @property {() => number} count Number of loads still running.
 */

/**
 * Creates a counter of running loads. onChange gets true when the first load starts
 * and false when the last one ends, so overlapping loads give one busy period.
 *
 * @param {(busy: boolean) => void} onChange Called when the busy state changes.
 * @returns {InFlight} The counter.
 */
export function createInFlight(onChange) {
    let running = 0;
    return {
        begin() {
            running += 1;
            if (running === 1) { onChange(true) }
        },
        end() {
            if (running === 0) { return }
            running -= 1;
            if (running === 0) { onChange(false) }
        },
        count() {
            return running;
        }
    };
}
