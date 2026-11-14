/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Quadlets module: settings, status filter, row helpers and the Quadlet resource card.
 * The list is what the quadlets-list action returns, mapped from `podman quadlet ls`.
 *
 * @file QuadletsModule.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {ResourceIcons} from '../../utils/ResourceIcons.js';

import {ResourceCard} from '../../components/resource/ResourceCard.jsx';
import {UnitViewModal} from '../../components/modals/UnitViewModal.jsx';

import {isServiceUnit} from '../../hooks/useUnitView.js';

import {BaseModule} from '../BaseModule.jsx';
import {QuadletStatusFilter} from '../filters/QuadletStatusFilter.js';
import {QuadletTypeFilter} from '../filters/QuadletTypeFilter.js';

/** @typedef {import('../../types/card.js').CardStatusVariant} CardStatusVariant */
/** @typedef {import('../../types/card.js').CardTone} CardTone */
/** @typedef {import('../../types/card.js').MenuDivider} MenuDivider */
/** @typedef {import('../../types/card.js').MenuItem} MenuItem */
/** @typedef {import('../../types/card.js').PropertyRow} PropertyRow */
/** @typedef {import('../../types/quadlet.js').QuadletItem} QuadletItem */
/** @typedef {import('../../types/quadlet.js').QuadletKind} QuadletKind */
/** @typedef {import('../../types/quadlet.js').QuadletsPageState} QuadletsPageState */
/** @typedef {import('../../types/service.js').UnitView} UnitView */

/**
 * Quadlets resource module. Needs admin access, as the later list action will run as root.
 * The cards stay short: the Quadlet name, an optional description, a type label, a status, and Unit, Pod and
 * Application rows only when those are set. There is no Inspect view. The menu has Show
 * Quadlet and Show Unit, which open the shared unit view, when the Quadlet has a service unit.
 * i18n() in the constructor runs at module load, the same as the module list in index.js.
 *
 * @augments {BaseModule<QuadletItem>}
 */
export class QuadletsModule extends BaseModule {
    /**
     * Builds the Quadlets module with its list action, status and type filters and card settings.
     */
    constructor() {
        super({
            id: 'quadlets',
            label: i18n("Quadlets"),
            action: 'quadlets-list',
            filter: [
                new QuadletStatusFilter({idPrefix: 'podshift-quadlet-state-'}),
                new QuadletTypeFilter({idPrefix: 'podshift-quadlet-type-'}),
            ],
            emptyTitle: i18n("No quadlets"),
            emptyBody: i18n("No matching quadlets."),
            idPrefix: 'podshift-quadlet-',
            icon: ResourceIcons.quadlet,
            quadletView: true,
        });
    }

    /**
     * Translated type labels, from the Quadlet file suffix.
     *
     * @type {Record<QuadletKind, function(): string>}
     */
    static TYPE_LABELS = {
        container: () => i18n("Container"),
        pod: () => i18n("Pod"),
        kube: () => i18n("Kube"),
        network: () => i18n("Network"),
        volume: () => i18n("Volume"),
        image: () => i18n("Image"),
        build: () => i18n("Build"),
    };

    /**
     * Translated status labels for the values `podman quadlet ls` reports, in the words of
     * the Services cards where they overlap.
     *
     * @type {Record<string, function(): { text: string, variant: CardStatusVariant|undefined }>}
     */
    static STATUS_LABELS = {
        'active/running': () => ({text: i18n("Running"), variant: 'success'}),
        'inactive/dead': () => ({text: i18n("Not running"), variant: undefined}),
        'failed/failed': () => ({text: i18n("Failed to start"), variant: 'danger'}),
        'activating/start': () => ({text: i18n("Starting"), variant: 'info'}),
        'deactivating/stop': () => ({text: i18n("Stopping"), variant: 'info'}),
        'Not loaded': () => ({text: i18n("Not loaded"), variant: undefined}),
        'loaded template': () => ({text: i18n("Loaded template"), variant: undefined}),
    };

    /**
     * Returns the translated type label of a Quadlet kind.
     *
     * @param {QuadletKind} [type] The kind, when known.
     * @returns {string|undefined} The translated label, or undefined when the type is missing.
     */
    static typeLabel(type) {
        if (!type) { return undefined }
        const label = QuadletsModule.TYPE_LABELS[type];
        return label ? label() : type;
    }

    /**
     * Returns the card label of a Quadlet: Running, Not running, Failed to start, Starting,
     * Stopping, Not loaded, Loaded template, or Active for any other active state.
     *
     * @param {QuadletItem} item The Quadlet.
     * @returns {{ text: string, variant: CardStatusVariant|undefined }} The translated text and its PatternFly status.
     */
    static statusLabel(item) {
        const status = item.status || '';
        const mapped = QuadletsModule.STATUS_LABELS[status];
        if (mapped) { return mapped() }
        if (status.startsWith('failed/')) { return {text: i18n("Failed to start"), variant: 'danger'} }
        if (status.startsWith('activating/')) { return {text: i18n("Starting"), variant: 'info'} }
        if (status.startsWith('deactivating/')) { return {text: i18n("Stopping"), variant: 'info'} }
        if (status.startsWith('inactive/')) { return {text: i18n("Not running"), variant: undefined} }
        if (status.startsWith('active/')) { return {text: i18n("Active"), variant: 'success'} }
        return {text: status, variant: undefined};
    }

    /**
     * Returns the tone of a Quadlet card: danger when failed, success when active, else neutral.
     * The status groups come from QuadletStatusFilter, so the tone and the filter agree.
     *
     * @param {QuadletItem} item The Quadlet.
     * @returns {CardTone} The card tone.
     */
    static quadletTone(item) {
        const group = QuadletStatusFilter.statusGroup(item);
        if (group === 'failed') { return 'danger' }
        return group === 'active' ? 'success' : 'neutral';
    }

    /**
     * Builds the card rows of a Quadlet: Unit, Pod and Application, each only when set.
     * The path stays off the card.
     *
     * @param {QuadletItem} item The Quadlet.
     * @returns {PropertyRow[]} The translated rows.
     */
    static quadletRows(item) {
        /** @type {PropertyRow[]} */
        const rows = [];
        if (item.unitName) { rows.push({id: 'unit', label: i18n("Unit"), value: item.unitName}) }
        if (item.pod) { rows.push({id: 'pod', label: i18n("Pod"), value: item.pod}) }
        if (item.app) { rows.push({id: 'app', label: i18n("Application"), value: item.app}) }
        return rows;
    }

    /**
     * Checks whether a Quadlet matches the filter text.
     *
     * @param {QuadletItem} item The Quadlet.
     * @param {string} query Lowercase filter text; empty matches all.
     * @returns {boolean} True when the name, description, unit, path, status, application, pod or type contains the text.
     */
    static matchesFilter(item, query) {
        if (!query) { return true }
        const haystack = `${item.id} ${item.title} ${item.description || ''} ${item.unitName} ${item.path} ${item.status} ${item.app} ${item.pod} ${item.type || ''}`.toLowerCase();
        return haystack.includes(query);
    }

    /**
     * Sorts Quadlets by title, then by the full file name so two items with the
     * same display name (for example "shop.pod" and "shop.network") stay in a stable order.
     *
     * @param {QuadletItem[]} items The items.
     * @returns {QuadletItem[]} A new array in display order.
     */
    static sortItems(items) {
        return items.slice().sort((a, b) => {
            const byTitle = a.title.localeCompare(b.title, undefined, {numeric: true, sensitivity: 'base'});
            if (byTitle !== 0) { return byTitle }
            return a.id.localeCompare(b.id, undefined, {numeric: true, sensitivity: 'base'});
        });
    }

    /**
     * Builds the menu items after Copy: Show Quadlet and Show Unit, which open the shared
     * unit view on the Quadlet or the Unit view. Both are hidden when the Quadlet has no
     * service unit, the same check as on the other resource cards.
     *
     * @param {QuadletItem} item The Quadlet.
     * @param {QuadletsPageState} state Page state, for the unit view opener.
     * @returns {(MenuItem|MenuDivider)[]} The menu items.
     */
    static cardActions(item, state) {
        if (!isServiceUnit(item.unitName)) { return [] }
        const {openUnitView} = state;
        /** @type {UnitView} */
        const base = {unit: item.unitName, initial: 'unit', hasQuadlet: true, quadletPath: item.path};
        return [
            {key: 'quadlet', label: i18n("Show Quadlet"), onClick: () => openUnitView({...base, initial: 'quadlet'})},
            {key: 'unit', label: i18n("Show Unit"), onClick: () => openUnitView(base)},
        ];
    }

    /**
     * Returns the toolbar count text for the number of visible Quadlets.
     *
     * @param {number} count Number of visible items.
     * @returns {string} The translated count text, for example "3 quadlets".
     */
    static countText(count) {
        return cockpit.format(cockpit.ngettext("$0 quadlet", "$0 quadlets", count), count);
    }

    /**
     * Builds the dialogues of the page: the unit view only. Quadlets have no Inspect view.
     *
     * @param {QuadletsPageState} state Page state, for the open view and its close function.
     * @returns {React.ReactElement} The dialogues.
     */
    dialogs(state) {
        const {closeUnitView} = state;
        const onRefresh = () => this.closeAndRefresh(state);
        return (
            <UnitViewModal view={state.unitView} onClose={closeUnitView} onRefresh={onRefresh}/>
        );
    }

    /**
     * Builds a resource card for one Quadlet.
     *
     * @param {QuadletItem} item The Quadlet.
     * @param {QuadletsPageState} state Page state, for the card menu actions.
     * @returns {React.ReactElement} The card, with key={item.id}.
     */
    card(item, state) {
        const Icon = ResourceIcons.forQuadlet(item.type);
        const label = QuadletsModule.statusLabel(item);
        return (
            <ResourceCard
                key={item.id}
                id={this.cardDomId(item)}
                title={item.title}
                description={item.description || undefined}
                subtitle={QuadletsModule.typeLabel(item.type)}
                icon={<Icon/>}
                /* Only a running unit gets the Running icon; Starting, Stopping and Active come from the status label. */
                running={item.status === 'active/running'}
                status={label.text}
                statusVariant={label.variant}
                tone={QuadletsModule.quadletTone(item)}
                rows={QuadletsModule.quadletRows(item)}
                actions={QuadletsModule.cardActions(item, state)}
            />
        );
    }
}

/**
 * Shared Quadlets module instance used by QuadletsPage and the module list.
 *
 * @type {QuadletsModule}
 */
export const quadletsModule = new QuadletsModule();
