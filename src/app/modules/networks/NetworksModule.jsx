/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Networks module: settings, row helpers and the network resource card.
 *
 * @file NetworksModule.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {ResourceIcons} from '../../utils/ResourceIcons.js';
import {ResourceTone} from '../../utils/ResourceTone.js';

import {ResourceCard} from '../../components/resource/ResourceCard.jsx';

import {BaseModule} from '../BaseModule.jsx';
import {SourceFilter} from '../filters/SourceFilter.js';

/** @typedef {import('../../types/card.js').CardStatusVariant} CardStatusVariant */
/** @typedef {import('../../types/module.js').ModulePageState} ModulePageState */
/** @typedef {import('../../types/resource.js').ResourceItem} ResourceItem */

/**
 * Networks resource module: settings, row helpers and the network card. The
 * default filter of BaseModule fits, since a network's id is its name.
 * i18n() in the constructor runs at module load, the same as the module list in index.js.
 *
 * @augments {BaseModule<ResourceItem>}
 */
export class NetworksModule extends BaseModule {
    /**
     * Builds the networks module with its list action, source filter and card settings.
     */
    constructor() {
        super({
            id: 'networks',
            label: i18n("Networks"),
            action: 'networks-list',
            kind: 'network',
            filter: new SourceFilter({idPrefix: 'podshift-network-source-', sources: ['quadlet', 'unit', 'unmanaged', 'builtin']}),
            emptyTitle: i18n("No networks"),
            emptyBody: i18n("No matching networks."),
            idPrefix: 'podshift-network-',
            icon: ResourceIcons.network,
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
     * Groups whose row labels are fixed words from the API; other groups use names as labels.
     *
     * @type {Set<string>}
     */
    static TRANSLATED_GROUPS = new Set(['systemd']);

    /**
     * Returns the toolbar count text for the number of visible networks.
     *
     * @param {number} count Number of visible items.
     * @returns {string} The translated count text, for example "3 networks".
     */
    static countText(count) {
        return cockpit.format(cockpit.ngettext("$0 network", "$0 networks", count), count);
    }

    /**
     * Builds a resource card for one network. Main row labels are translated; the values stay as given.
     *
     * @param {ResourceItem} item The network.
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
                status={i18n(item.status)}
                statusVariant={NetworksModule.STATUS_VARIANTS[item.status]}
                tone={ResourceTone.usageTone(item)}
                source={item.source}
                rows={(item.rows || []).map(row => ({...row, label: i18n(row.label)}))}
                groups={NetworksModule.cardGroups(item)}
                actions={NetworksModule.cardActions(item, state)}
            />
        );
    }
}

/**
 * Shared networks module instance used by NetworksPage and the module list.
 *
 * @type {NetworksModule}
 */
export const networksModule = new NetworksModule();
