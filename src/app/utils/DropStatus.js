/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Status helpers of the drop history: the icon kind of each PodShift status, whether the
 * history still has an item in progress, the poll schedules of the tab and a drop made
 * elsewhere, the quadlet-remove name
 * of a history name, and whether a new drop of an uploaded name has appeared so the
 * success notice can hide.
 *
 * @file DropStatus.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/** @typedef {import('../types/drop.js').DropStatus} DropStatus */
/** @typedef {import('../types/drop.js').DropStatusKind} DropStatusKind */
/** @typedef {import('../types/drop.js').DropHistoryItem} DropHistoryItem */
/** @typedef {import('../types/drop.js').DropPollStep} DropPollStep */
/** @typedef {import('../types/drop.js').DropPollCard} DropPollCard */

/**
 * Status helpers of the drop history.
 */
export class DropStatus {
    /**
     * Statuses of an item that PodShift is still working on.
     *
     * @type {DropStatus[]}
     */
    static PROGRESS = ['accepted', 'validated', 'installing'];

    /**
     * Poll delays of the monitoring schedule, by time since auto refresh was turned on or
     * restarted (the page opened or became active, or Refresh was clicked). Each step lasts
     * until untilMs; the last one has no end, as auto refresh turns off at 4 minutes.
     *
     * @type {DropPollStep[]}
     */
    static MONITOR_STEPS = [
        {untilMs: 15000, historyMs: 1000, logMs: 1000},
        {untilMs: 30000, historyMs: 2000, logMs: 5000},
        {untilMs: 120000, historyMs: 3000, logMs: 10000},
        {untilMs: Infinity, historyMs: 5000, logMs: 15000}
    ];

    /**
     * Poll delays of the dropping schedule, by time since the last drop, on this page or in a
     * terminal. Both cards use the same delay. After the last step the monitoring schedule
     * alone applies.
     *
     * @type {DropPollStep[]}
     */
    static DROP_STEPS = [
        {untilMs: 15000, historyMs: 300, logMs: 300},
        {untilMs: 30000, historyMs: 500, logMs: 500},
        {untilMs: 60000, historyMs: 1000, logMs: 1000},
        {untilMs: 120000, historyMs: 2000, logMs: 2000}
    ];

    /**
     * Longest poll delay while the history has an item in progress, in ms.
     *
     * @type {number}
     */
    static PROGRESS_MAX_MS = 1000;

    /**
     * Returns the icon kind of a status. An unknown status shows as failed.
     *
     * @param {string} status Status from quadlet-drop-history.
     * @returns {DropStatusKind} progress, installed, unchanged, failed or refused.
     */
    static kind(status) {
        if (DropStatus.PROGRESS.includes(/** @type {DropStatus} */ (status))) { return 'progress' }
        if (status === 'installed' || status === 'unchanged' || status === 'refused') { return status }
        return 'failed';
    }

    /**
     * Tells whether the history has an item that is still in progress.
     *
     * @param {DropHistoryItem[]|null|undefined} items History items.
     * @returns {boolean} True when an item is in progress.
     */
    static needsPoll(items) {
        return Array.isArray(items) && items.some(item => DropStatus.kind(item?.status) === 'progress');
    }

    /**
     * Returns the delay of one card in a step table at a time since the schedule started.
     *
     * @param {DropPollStep[]} steps Step table, MONITOR_STEPS or DROP_STEPS.
     * @param {DropPollCard} card The card: history or log.
     * @param {number} ms Milliseconds since the schedule started; NaN or below 0 for none.
     * @returns {number} The delay in ms, or 0 when the schedule does not apply.
     */
    static stepDelay(steps, card, ms) {
        if (!(ms >= 0)) { return 0 }
        const step = steps.find(item => ms < item.untilMs);
        if (!step) { return 0 }
        return card === 'log' ? step.logMs : step.historyMs;
    }

    /**
     * Returns the poll delay of a card: the faster of the monitoring and the dropping
     * schedule, and at most PROGRESS_MAX_MS while an item is in progress. Without a monitoring
     * start, the last monitoring step applies.
     *
     * @param {DropPollCard} card The card: history or log.
     * @param {number} msSinceMonitor Milliseconds since auto refresh was turned on or restarted, or NaN.
     * @param {number} msSinceDrop Milliseconds since the last drop, or NaN for none.
     * @param {boolean} inProgress True when the history has an item in progress.
     * @returns {number} The delay in ms.
     */
    static pollDelay(card, msSinceMonitor, msSinceDrop, inProgress) {
        const last = DropStatus.MONITOR_STEPS[DropStatus.MONITOR_STEPS.length - 1];
        let delay = DropStatus.stepDelay(DropStatus.MONITOR_STEPS, card, msSinceMonitor);
        if (!delay) { delay = card === 'log' ? last.logMs : last.historyMs }
        const dropping = DropStatus.stepDelay(DropStatus.DROP_STEPS, card, msSinceDrop);
        if (dropping && dropping < delay) { delay = dropping }
        if (inProgress && delay > DropStatus.PROGRESS_MAX_MS) { delay = DropStatus.PROGRESS_MAX_MS }
        return delay;
    }

    /**
     * Tells whether the history has a drop the page did not upload, such as one made in a
     * terminal: an item whose ID was not in the last history, and whose name is not one the
     * page is uploading.
     *
     * @param {DropHistoryItem[]|null|undefined} items History items.
     * @param {Set<string>} seenIds IDs of the last history the page saw.
     * @param {Set<string>} ownNames Names of the files this page dropped whose rows have not shown yet.
     * @returns {boolean} True when a new item came from elsewhere.
     */
    static hasTerminalDrop(items, seenIds, ownNames) {
        return Array.isArray(items) && items.some(item => !seenIds.has(item?.id) && !ownNames.has(item?.name));
    }

    /**
     * Tells whether the reason of an item is shown: only for a failed or refused item that has one.
     *
     * @param {DropHistoryItem} item History item.
     * @returns {boolean} True when the reason is shown.
     */
    static showsReason(item) {
        const kind = DropStatus.kind(item.status);
        return (kind === 'failed' || kind === 'refused') && typeof item.reason === 'string' && item.reason !== '';
    }

    /**
     * Tells whether the history has a drop of this name that was not already present when the
     * upload succeeded, so the success notice can hide.
     *
     * @param {DropHistoryItem[]|null|undefined} items History items.
     * @param {string} name Uploaded file name.
     * @param {Set<string>} knownIds IDs already in the history when the upload succeeded.
     * @returns {boolean} True when a new row for the name is present.
     */
    static hasNewDrop(items, name, knownIds) {
        return Array.isArray(items) && items.some(item => item?.name === name && !knownIds.has(item.id));
    }

    /**
     * Returns the quadlet-remove name of a history name: a bundle is logged as shop.zip and
     * removed by its app name shop; a Quadlet file keeps its name.
     *
     * @param {string} name History name, for example web.container or shop.zip.
     * @returns {string} The name for quadlet-remove.
     */
    static removeName(name) {
        return name.endsWith('.zip') ? name.slice(0, -4) : name;
    }
}
