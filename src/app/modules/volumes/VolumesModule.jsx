/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Volumes module: settings, filter and row helpers and the volume resource card.
 *
 * @file VolumesModule.jsx
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
/** @typedef {import('../../types/card.js').PropertyRow} PropertyRow */
/** @typedef {import('../../types/module.js').ModulePageState} ModulePageState */
/** @typedef {import('../../types/resource.js').ResourceItem} ResourceItem */
/** @typedef {import('../../types/resource.js').ResourceRow} ResourceRow */

/**
 * Volumes resource module: settings, filter and row helpers and the volume card.
 * i18n() in the constructor runs at module load, the same as the module list in index.js.
 *
 * @augments {BaseModule<ResourceItem>}
 */
export class VolumesModule extends BaseModule {
    /**
     * Builds the volumes module with its list action, source filter and card settings.
     */
    constructor() {
        super({
            id: 'volumes',
            label: i18n("Volumes"),
            action: 'volumes-list',
            kind: 'volume',
            filter: new SourceFilter({idPrefix: 'podshift-volume-source-', sources: ['quadlet', 'container', 'unmanaged']}),
            emptyTitle: i18n("No volumes"),
            emptyBody: i18n("No matching volumes."),
            idPrefix: 'podshift-volume-',
            icon: ResourceIcons.volume,
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
     * Translated text for fixed row values.
     *
     * @type {Record<string, function(): string>}
     */
    static FIXED_VALUES = {
        Yes: () => i18n("Yes"),
        No: () => i18n("No"),
    };

    /**
     * Checks whether a volume matches the filter text.
     *
     * @param {ResourceItem} item The volume.
     * @param {string} query Lowercase filter text; empty matches all.
     * @returns {boolean} True when the full name, title or mountpoint contains the text.
     */
    static matchesFilter(item, query) {
        if (!query) { return true }
        const haystack = `${item.id} ${item.title} ${this.rowText(item, 'mountpoint')}`.toLowerCase();
        return haystack.includes(query);
    }

    /**
     * Translates a group row label, and the Yes and No values of the anonymous row.
     *
     * @param {ResourceRow} row The row from the API.
     * @returns {PropertyRow} The row ready for display.
     */
    static translateGroupRow(row) {
        const fixed = row.id === 'anonymous' ? this.FIXED_VALUES[String(row.value)] : undefined;
        return {...row, label: i18n(row.label), value: fixed ? fixed() : row.value};
    }

    /**
     * Returns the toolbar count text for the number of visible volumes.
     *
     * @param {number} count Number of visible items.
     * @returns {string} The translated count text, for example "3 volumes".
     */
    static countText(count) {
        return cockpit.format(cockpit.ngettext("$0 volume", "$0 volumes", count), count);
    }

    /**
     * Builds a resource card for one volume.
     *
     * @param {ResourceItem} item The volume.
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
                statusVariant={VolumesModule.STATUS_VARIANTS[item.status]}
                tone={ResourceTone.usageTone(item)}
                source={item.source}
                rows={(item.rows || []).map(row => translateResourceRow(row))}
                groups={VolumesModule.cardGroups(item)}
                actions={VolumesModule.cardActions(item, state)}
            />
        );
    }
}

/**
 * Shared volumes module instance used by VolumesPage and the module list.
 *
 * @type {VolumesModule}
 */
export const volumesModule = new VolumesModule();
