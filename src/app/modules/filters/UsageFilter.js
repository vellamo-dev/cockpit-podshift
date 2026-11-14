/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Usage filter of the Secrets module: All, In use and Unused, by item.inUse.
 *
 * @file UsageFilter.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {i18n} from '../../utils/i18n.js';

import {BaseFilter} from './BaseFilter.js';

/** @typedef {import('../../types/filter.js').FilterOption} FilterOption */
/** @typedef {import('../../types/filter.js').UsageFilterSettings} UsageFilterSettings */
/** @typedef {import('../../types/secret.js').SecretItem} SecretItem */

/**
 * Filters secrets by use. A secret used by any container, running or stopped, is in use.
 * i18n() in the constructor runs at module load, the same as the module labels.
 *
 * @augments {BaseFilter<SecretItem>}
 */
export class UsageFilter extends BaseFilter {
    /**
     * Builds the usage filter.
     *
     * @param {UsageFilterSettings} settings Id prefix of the toggle buttons.
     */
    constructor(settings) {
        super({idPrefix: settings.idPrefix, label: i18n("Usage")});
    }

    /**
     * Returns All, In use and Unused.
     *
     * @returns {FilterOption[]} The options.
     */
    options() {
        return [
            {id: BaseFilter.ALL, label: i18n("All")},
            {id: 'in-use', label: i18n("In use")},
            {id: 'unused', label: i18n("Unused")},
        ];
    }

    /**
     * Checks whether a secret matches In use or Unused. Unknown options let every secret pass.
     *
     * @param {SecretItem} item The secret.
     * @param {string} value Selected option id, 'in-use' or 'unused'.
     * @returns {boolean} True when the secret is shown.
     */
    matchesOption(item, value) {
        const used = item.inUse === true;
        if (value === 'in-use') { return used }
        if (value === 'unused') { return !used }
        return true;
    }
}
