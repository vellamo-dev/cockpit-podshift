/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Containers module: settings, card formatting and the container resource card.
 *
 * @file ContainersModule.jsx
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
/** @typedef {import('../../types/card.js').PropertyGroup} PropertyGroup */
/** @typedef {import('../../types/card.js').PropertyRow} PropertyRow */
/** @typedef {import('../../types/module.js').ModulePageState} ModulePageState */
/** @typedef {import('../../types/resource.js').ResourceItem} ResourceItem */
/** @typedef {import('../../types/resource.js').ResourceRow} ResourceRow */

/**
 * Containers resource module: settings, formatting helpers and the container card.
 * i18n() in the constructor runs at module load, the same as the module list in index.js.
 *
 * @augments {BaseModule<ResourceItem>}
 */
export class ContainersModule extends BaseModule {
    /**
     * Builds the containers module with its list action, source filter and card settings.
     */
    constructor() {
        super({
            id: 'containers',
            label: i18n("Containers"),
            action: 'containers-list',
            kind: 'container',
            filter: new SourceFilter({idPrefix: 'podshift-container-source-', sources: ['quadlet', 'unit', 'unmanaged']}),
            emptyTitle: i18n("No containers"),
            emptyBody: i18n("No matching containers."),
            idPrefix: 'podshift-container-',
            icon: ResourceIcons.container,
            variables: true,
            showOpenInPodman: true,
        });
    }

    /**
     * PatternFly Label status for each container state.
     *
     * @type {Record<string, CardStatusVariant>}
     */
    static STATUS_VARIANTS = {
        Running: 'success',
        Paused: 'warning',
    };

    /**
     * Translated text for each container state.
     *
     * @type {Record<string, function(): string>}
     */
    static STATUS_TEXTS = {
        Running: () => i18n("Running"),
        Paused: () => i18n("Paused"),
        Exited: () => i18n("Exited"),
        Created: () => i18n("Created"),
    };

    /**
     * Translated text for the fixed values of the Health and Auto-update rows.
     *
     * @type {Record<string, function(): string>}
     */
    static FIXED_VALUES = {
        Healthy: () => i18n("Healthy"),
        Unhealthy: () => i18n("Unhealthy"),
        Starting: () => i18n("Starting"),
        Registry: () => i18n("Registry"),
        Local: () => i18n("Local"),
        Off: () => i18n("Off"),
    };

    /**
     * Row ids whose values are fixed words from the API.
     *
     * @type {Set<string>}
     */
    static FIXED_ROWS = new Set(['health', 'auto-update']);

    /**
     * Row ids whose values are shown in a monospace font.
     *
     * @type {Set<string>}
     */
    static MONO_ROWS = new Set(['command', 'entrypoint']);

    /**
     * Returns the translated text of a container state.
     *
     * @param {string} [status] State from the API, for example 'Running'.
     * @returns {string} The translated state, or the state as given when it is unknown.
     */
    static statusText(status) {
        const text = status ? this.STATUS_TEXTS[status] : undefined;
        return text ? text() : (status || '');
    }

    /**
     * Translates a row label, and the value of a fixed row.
     * An auto-update policy without effect gets a note in its value.
     *
     * @param {ResourceRow} row The row from the API.
     * @param {ResourceItem} item The container the row belongs to.
     * @returns {PropertyRow} The row ready for display.
     */
    static translateRow(row, item) {
        const fixed = this.FIXED_ROWS.has(row.id) ? this.FIXED_VALUES[String(row.value)] : undefined;
        let value = fixed ? fixed() : row.value;
        if (row.id === 'auto-update' && item.autoUpdate && item.autoUpdateActive === false) { value = cockpit.format(i18n("$0 (no effect, not run by systemd)"), value) }
        return {...row, label: i18n(row.label), value, mono: this.MONO_ROWS.has(row.id)};
    }

    /**
     * Translates the group labels and rows of a container.
     *
     * @param {ResourceItem} item The container.
     * @returns {PropertyGroup[]} The groups ready for display.
     */
    static cardGroups(item) {
        return (item.groups || []).map(group => ({
            ...group,
            label: i18n(group.label),
            rows: (group.rows || []).map(row => this.translateRow(row, item))
        }));
    }

    /**
     * Builds the tooltip of the auto-update label.
     *
     * @param {ResourceItem} item The container.
     * @returns {string} The tooltip, or an empty string when auto-update is off.
     */
    static autoUpdateTooltip(item) {
        if (!item.autoUpdate) { return '' }
        const policy = item.autoUpdate === 'local' ? i18n("Local") : i18n("Registry");
        if (item.autoUpdateActive === false) { return cockpit.format(i18n("Auto-update: $0, no effect because systemd does not run the container"), policy) }
        return cockpit.format(i18n("Auto-update: $0"), policy);
    }

    /**
     * Checks whether a container matches the filter text.
     *
     * @param {ResourceItem} item The container.
     * @param {string} query Lowercase filter text; empty matches all.
     * @returns {boolean} True when the id, name or image contains the text.
     */
    static matchesFilter(item, query) {
        if (!query) { return true }
        const haystack = `${item.id} ${item.title} ${this.rowText(item, 'image')}`.toLowerCase();
        return haystack.includes(query);
    }

    /**
     * Returns the toolbar count text for the number of visible containers.
     *
     * @param {number} count Number of visible items.
     * @returns {string} The translated count text, for example "3 containers".
     */
    static countText(count) {
        return cockpit.format(cockpit.ngettext("$0 container", "$0 containers", count), count);
    }

    /**
     * Returns the DOM id of a container card: the id prefix plus the container name.
     *
     * @param {ResourceItem} item The container.
     * @returns {string} The element id, for example 'podshift-container-web'.
     */
    cardDomId(item) {
        return this.idPrefix + item.title;
    }

    /**
     * Builds a resource card for one container.
     *
     * @param {ResourceItem} item The container.
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
                autoUpdate={ContainersModule.autoUpdateTooltip(item)}
                autoUpdateWarning={Boolean(item.autoUpdate) && item.autoUpdateActive === false}
                status={ContainersModule.statusText(item.status)}
                statusVariant={ContainersModule.STATUS_VARIANTS[item.status]}
                tone={ResourceTone.containerTone(item)}
                source={item.source}
                rows={(item.rows || []).map(row => (row.id === 'created' ? translateResourceRow(row) : ContainersModule.translateRow(row, item)))}
                groups={ContainersModule.cardGroups(item)}
                actions={ContainersModule.cardActions(item, state)}
            />
        );
    }
}

/**
 * Shared containers module instance used by ContainersPage and the module list.
 *
 * @type {ContainersModule}
 */
export const containersModule = new ContainersModule();
