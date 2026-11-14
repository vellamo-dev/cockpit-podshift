/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Status filter of the Quadlets module: All, Active, Inactive and Failed, by the
 * status `podman quadlet ls` reports.
 *
 * @file QuadletStatusFilter.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {i18n} from '../../utils/i18n.js';

import {BaseFilter} from './BaseFilter.js';

/** @typedef {import('../../types/filter.js').FilterOption} FilterOption */
/** @typedef {import('../../types/filter.js').QuadletStatusFilterSettings} QuadletStatusFilterSettings */
/** @typedef {import('../../types/quadlet.js').QuadletItem} QuadletItem */
/** @typedef {import('../../types/quadlet.js').QuadletStatusGroup} QuadletStatusGroup */

/**
 * Filters Quadlets by status group. Active also covers starting and stopping units.
 * i18n() in the constructor runs at module load, the same as the module labels.
 *
 * @augments {BaseFilter<QuadletItem>}
 */
export class QuadletStatusFilter extends BaseFilter {
    /**
     * Builds the Quadlet status filter.
     *
     * @param {QuadletStatusFilterSettings} settings Id prefix of the toggle buttons.
     */
    constructor(settings) {
        super({idPrefix: settings.idPrefix, label: i18n("State")});
    }

    /**
     * Returns the status group of a Quadlet, for the filter and the card tone.
     *
     * @param {QuadletItem} item The Quadlet.
     * @returns {QuadletStatusGroup} failed when the status is failed, active when it is
     *   active, starting or stopping, else inactive (including Not loaded and loaded template).
     */
    static statusGroup(item) {
        const status = item.status || '';
        if (status === 'failed' || status.startsWith('failed/')) { return 'failed' }
        if (status.startsWith('active/') || status.startsWith('activating/') || status.startsWith('deactivating/')) { return 'active' }
        return 'inactive';
    }

    /**
     * Returns All, Active, Inactive and Failed.
     *
     * @returns {FilterOption[]} The options.
     */
    options() {
        return [
            {id: BaseFilter.ALL, label: i18n("All")},
            {id: 'active', label: i18n("Active")},
            {id: 'inactive', label: i18n("Inactive")},
            {id: 'failed', label: i18n("Failed")},
        ];
    }

    /**
     * Checks whether a Quadlet is in the selected status group.
     *
     * @param {QuadletItem} item The Quadlet.
     * @param {string} value Selected option id, 'active', 'inactive' or 'failed'.
     * @returns {boolean} True when the Quadlet is shown.
     */
    matchesOption(item, value) {
        return QuadletStatusFilter.statusGroup(item) === value;
    }
}
