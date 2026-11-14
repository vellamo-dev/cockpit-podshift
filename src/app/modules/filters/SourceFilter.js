/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Source filter of the resource modules: All, then the sources a module supports, by item.source.
 *
 * @file SourceFilter.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {i18n} from '../../utils/i18n.js';
import {ResourceSource} from '../../utils/ResourceSource.js';

import {BaseFilter} from './BaseFilter.js';

/** @typedef {import('../../types/filter.js').FilterOption} FilterOption */
/** @typedef {import('../../types/filter.js').SourceFilterSettings} SourceFilterSettings */
/** @typedef {import('../../types/resource.js').ResourceItem} ResourceItem */
/** @typedef {import('../../types/resource.js').ResourceSourceId} ResourceSourceId */

/**
 * Filters resources by source (Quadlet, Container, Unit, Manual, Built-in).
 * i18n() in the constructor runs at module load, the same as the module labels.
 *
 * @augments {BaseFilter<ResourceItem>}
 */
export class SourceFilter extends BaseFilter {
    /**
     * Builds a source filter for the given sources.
     *
     * @param {SourceFilterSettings} settings Id prefix and the source keys shown after All.
     */
    constructor(settings) {
        super({idPrefix: settings.idPrefix, label: i18n("Source")});
        /** @type {ResourceSourceId[]} */
        this.sources = settings.sources;
    }

    /**
     * Returns All, then the module's sources in RESOURCE_SOURCES order.
     *
     * @returns {FilterOption[]} The options.
     */
    options() {
        return ResourceSource.sourceFilterOptions(this.sources);
    }

    /**
     * Checks whether a resource comes from the selected source.
     *
     * @param {ResourceItem} item The resource.
     * @param {string} value Selected source id, for example 'quadlet'.
     * @returns {boolean} True when item.source is the selected source.
     */
    matchesOption(item, value) {
        return item.source === value;
    }
}
