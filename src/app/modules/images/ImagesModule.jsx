/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Images module: settings, filter and inspect helpers and the image resource card.
 *
 * @file ImagesModule.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {ResourceIcons} from '../../utils/ResourceIcons.js';
import {translateResourceRow} from '../../utils/translateResourceRow.js';
import {ResourceTone} from '../../utils/ResourceTone.js';

import {ResourceCard} from '../../components/resource/ResourceCard.jsx';

import {BaseModule} from '../BaseModule.jsx';
import {SourceFilter} from '../filters/SourceFilter.js';

/** @typedef {import('../../types/card.js').CardStatusVariant} CardStatusVariant */
/** @typedef {import('../../types/module.js').ModulePageState} ModulePageState */
/** @typedef {import('../../types/resource.js').ResourceItem} ResourceItem */

/**
 * Images resource module: settings, filter and inspect helpers and the image card.
 * i18n() in the constructor runs at module load, the same as the module list in index.js.
 *
 * @augments {BaseModule<ResourceItem>}
 */
export class ImagesModule extends BaseModule {
    /**
     * Builds the images module with its list action, source filter and card settings.
     */
    constructor() {
        super({
            id: 'images',
            label: i18n("Images"),
            action: 'images-list',
            kind: 'image',
            filter: new SourceFilter({idPrefix: 'podshift-image-source-', sources: ['quadlet', 'container', 'unmanaged']}),
            emptyTitle: i18n("No images"),
            emptyBody: i18n("No matching images."),
            idPrefix: 'podshift-image-',
            icon: ResourceIcons.image,
            showOpenInPodman: true,
        });
    }

    /**
     * PatternFly Label status for each API status text.
     *
     * @type {Record<string, CardStatusVariant>}
     */
    static STATUS_VARIANTS = {
        'In use': 'success',
    };

    /**
     * Groups whose row labels are fixed words from the API and are translated.
     *
     * @type {Set<string>}
     */
    static TRANSLATED_GROUPS = new Set(['details', 'systemd']);

    /**
     * Checks whether an image matches the filter text.
     *
     * @param {ResourceItem} item The image.
     * @param {string} query Lowercase filter text; empty matches all.
     * @returns {boolean} True when the title, subtitle, URL or tags contain the text.
     */
    static matchesFilter(item, query) {
        if (!query) { return true }
        const haystack = `${item.title} ${item.subtitle || ''} ${this.rowText(item, 'url')} ${this.rowText(item, 'tags')}`.toLowerCase();
        return haystack.includes(query);
    }

    /**
     * Returns the inspect ref of an image: the full image ID, or the short ID when it is missing.
     *
     * @param {ResourceItem} item The image.
     * @returns {string} The ref passed to the inspect action.
     */
    static inspectRef(item) {
        return item.fullId || item.id;
    }

    /**
     * Returns the toolbar count text for the number of visible images.
     *
     * @param {number} count Number of visible items.
     * @returns {string} The translated count text, for example "3 images".
     */
    static countText(count) {
        return cockpit.format(cockpit.ngettext("$0 image", "$0 images", count), count);
    }

    /**
     * Builds a resource card for one image.
     *
     * @param {ResourceItem} item The image.
     * @param {ModulePageState} state Page state, for the card menu actions.
     * @returns {React.ReactElement} The card, with key={item.id}.
     */
    card(item, state) {
        const Icon = this.icon;
        return (
            <ResourceCard
                key={item.id}
                id={this.cardDomId(item)}
                title={item.title}
                subtitle={item.subtitle}
                icon={<Icon/>}
                running={item.running === true}
                status={i18n(item.status)}
                statusVariant={ImagesModule.STATUS_VARIANTS[item.status]}
                tone={ResourceTone.usageTone(item)}
                source={item.source}
                rows={(item.rows || []).map(row => translateResourceRow(row))}
                groups={ImagesModule.cardGroups(item)}
                actions={ImagesModule.cardActions(item, state)}
            />
        );
    }
}

/**
 * Shared images module instance used by ImagesPage and the module list.
 *
 * @type {ImagesModule}
 */
export const imagesModule = new ImagesModule();
