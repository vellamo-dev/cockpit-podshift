/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * State filter of the Services module: All, Active, Inactive and Failed, by the
 * systemd active state.
 *
 * @file StateFilter.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {i18n} from '../../utils/i18n.js';

import {BaseFilter} from './BaseFilter.js';

/** @typedef {import('../../types/filter.js').FilterOption} FilterOption */
/** @typedef {import('../../types/filter.js').StateFilterSettings} StateFilterSettings */
/** @typedef {import('../../types/service.js').ServiceItem} ServiceItem */

/**
 * Filters services by state group. Active also covers starting, stopping and
 * reloading units. i18n() in the constructor runs at module load, the same as the
 * module labels.
 *
 * @augments {BaseFilter<ServiceItem>}
 */
export class StateFilter extends BaseFilter {
    /**
     * Builds the state filter.
     *
     * @param {StateFilterSettings} settings Id prefix of the toggle buttons.
     */
    constructor(settings) {
        super({idPrefix: settings.idPrefix, label: i18n("State")});
    }

    /**
     * Returns the state group of a service, for the filter and the card tone.
     *
     * @param {ServiceItem} item The service.
     * @returns {'active'|'inactive'|'failed'} failed for failed, inactive for inactive, else active.
     */
    static stateGroup(item) {
        if (item.activeState === 'failed') { return 'failed' }
        if (item.activeState === 'inactive') { return 'inactive' }
        return 'active';
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
     * Checks whether a service is in the selected state group.
     *
     * @param {ServiceItem} item The service.
     * @param {string} value Selected option id, 'active', 'inactive' or 'failed'.
     * @returns {boolean} True when the service is shown.
     */
    matchesOption(item, value) {
        return StateFilter.stateGroup(item) === value;
    }
}
