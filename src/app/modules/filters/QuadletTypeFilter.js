/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Type filter of the Quadlets module: All, then Container, Pod, Volume, Network,
 * Kube and Image, by the Quadlet file suffix.
 *
 * @file QuadletTypeFilter.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {i18n} from '../../utils/i18n.js';

import {BaseFilter} from './BaseFilter.js';

/** @typedef {import('../../types/filter.js').FilterOption} FilterOption */
/** @typedef {import('../../types/filter.js').QuadletTypeFilterSettings} QuadletTypeFilterSettings */
/** @typedef {import('../../types/quadlet.js').QuadletItem} QuadletItem */
/** @typedef {import('../../types/quadlet.js').QuadletKind} QuadletKind */

/**
 * Filters Quadlets by type. i18n() in the constructor runs at module load, the
 * same as the module labels.
 *
 * @augments {BaseFilter<QuadletItem>}
 */
export class QuadletTypeFilter extends BaseFilter {
    /**
     * Types shown after All, in display order.
     *
     * @type {QuadletKind[]}
     */
    static TYPES = ['container', 'pod', 'volume', 'network', 'kube', 'image'];

    /**
     * Translated type labels for the toggle options.
     *
     * @type {Record<QuadletKind, function(): string>}
     */
    static TYPE_LABELS = {
        container: () => i18n("Container"),
        pod: () => i18n("Pod"),
        volume: () => i18n("Volume"),
        network: () => i18n("Network"),
        kube: () => i18n("Kube"),
        image: () => i18n("Image"),
    };

    /**
     * Builds the Quadlet type filter.
     *
     * @param {QuadletTypeFilterSettings} settings Id prefix of the toggle buttons.
     */
    constructor(settings) {
        super({idPrefix: settings.idPrefix, label: i18n("Type")});
    }

    /**
     * Returns All, then Container, Pod, Volume, Network, Kube and Image.
     *
     * @returns {FilterOption[]} The options.
     */
    options() {
        return [
            {id: BaseFilter.ALL, label: i18n("All")},
            ...QuadletTypeFilter.TYPES.map(type => ({
                id: type,
                label: QuadletTypeFilter.TYPE_LABELS[type](),
            })),
        ];
    }

    /**
     * Checks whether a Quadlet is of the selected type.
     *
     * @param {QuadletItem} item The Quadlet.
     * @param {string} value Selected option id, for example 'container'.
     * @returns {boolean} True when the Quadlet is shown.
     */
    matchesOption(item, value) {
        return item.type === value;
    }
}
