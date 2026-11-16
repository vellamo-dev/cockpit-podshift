/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Services module: settings, state filter, row helpers, the service resource card and
 * the unit, status and log dialogs. The systemd user services of the podshift user are
 * listed like `systemctl --user list-units --type=service --all`, without units that are
 * not found. The data comes from the services-list action; the views from quadlet-view,
 * service-view and service-logs.
 *
 * @file ServicesModule.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {CogsIcon} from '@patternfly/react-icons/dist/esm/icons/cogs-icon';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {formatCreated} from '../../utils/formatCreated.js';
import {CockpitLinks} from '../../utils/CockpitLinks.js';
import {serviceDisplayName} from '../../utils/resourceName.js';

import {ResourceCard} from '../../components/resource/ResourceCard.jsx';
import {UnitViewModal} from '../../components/modals/UnitViewModal.jsx';
import {ServiceLogModal} from '../../components/modals/ServiceLogModal.jsx';
import {ServiceStatusModal} from '../../components/modals/ServiceStatusModal.jsx';

import {BaseModule} from '../BaseModule.jsx';
import {StateFilter} from '../filters/StateFilter.js';

/** @typedef {import('../../types/card.js').CardTone} CardTone */
/** @typedef {import('../../types/card.js').MenuDivider} MenuDivider */
/** @typedef {import('../../types/card.js').MenuItem} MenuItem */
/** @typedef {import('../../types/card.js').PropertyRow} PropertyRow */
/** @typedef {import('../../types/service.js').ServiceItem} ServiceItem */
/** @typedef {import('../../types/service.js').ServicesPageState} ServicesPageState */
/** @typedef {import('../../types/service.js').UnitView} UnitView */

/**
 * Services resource module. Needs admin access, since the handler runs as root. The menu
 * shows the Quadlet file (Quadlet services only), the unit file, the status and the log,
 * with no start or stop. The Quadlet file and the unit file share one dialog, UnitViewModal;
 * there is no Inspect view. Open log, which goes to Cockpit's Logs page, is only shown to
 * admins. There is no link to Cockpit's Services page, which only shows the signed-in
 * user's own units. i18n() in the constructor runs at module load, the same as the module
 * list in index.js.
 *
 * @augments {BaseModule<ServiceItem>}
 */
export class ServicesModule extends BaseModule {
    /**
     * Builds the services module with its list action, state filter and card settings.
     */
    constructor() {
        super({
            id: 'services',
            label: i18n("Services"),
            action: 'services-list',
            filter: new StateFilter({idPrefix: 'podshift-service-state-'}),
            emptyTitle: i18n("No services"),
            emptyBody: i18n("No matching services."),
            idPrefix: 'podshift-service-',
            icon: CogsIcon,
        });
    }

    /**
     * Translated systemd active states, used in the Active row.
     *
     * @type {Record<string, function(): string>}
     */
    static ACTIVE_STATES = {
        active: () => i18n("Active"),
        inactive: () => i18n("Inactive"),
        failed: () => i18n("Failed"),
        activating: () => i18n("Activating"),
        deactivating: () => i18n("Deactivating"),
        reloading: () => i18n("Reloading"),
    };

    /**
     * Translated unit file states, as Cockpit's Services page shows them.
     *
     * @type {Record<string, function(): string>}
     */
    static UNIT_FILE_STATES = {
        enabled: () => i18n("Enabled"),
        disabled: () => i18n("Disabled"),
        static: () => i18n("Static"),
        generated: () => i18n("Generated"),
        masked: () => i18n("Masked"),
    };

    /**
     * Returns the translated text of a value from one of the label maps.
     *
     * @param {Record<string, function(): string>} map The label map.
     * @param {string} value The untranslated value.
     * @returns {string} The translated text, or the value when the map has none.
     */
    static mapText(map, value) {
        return map[value] ? map[value]() : value;
    }

    /**
     * Returns the card label of a service, in Cockpit's words: Running, Active (for example
     * a oneshot that exited), Starting, Stopping, Failed to start or Not running.
     *
     * @param {ServiceItem} item The service.
     * @returns {{ text: string, variant: 'success'|'danger'|'info'|undefined }} The translated text and its PatternFly status.
     */
    static stateLabel(item) {
        if (item.activeState === 'failed') { return {text: i18n("Failed to start"), variant: 'danger'} }
        if (item.activeState === 'activating') { return {text: i18n("Starting"), variant: 'info'} }
        if (item.activeState === 'deactivating') { return {text: i18n("Stopping"), variant: 'info'} }
        if (item.activeState === 'inactive') { return {text: i18n("Not running"), variant: undefined} }
        if (item.subState === 'running') { return {text: i18n("Running"), variant: 'success'} }
        return {text: i18n("Active"), variant: 'success'};
    }

    /**
     * Returns the tone of a service card: danger when failed, success when active, else neutral.
     * The state groups come from StateFilter, so the tone and the filter agree.
     *
     * @param {ServiceItem} item The service.
     * @returns {CardTone} The card tone.
     */
    static serviceTone(item) {
        const group = StateFilter.stateGroup(item);
        if (group === 'failed') { return 'danger' }
        return group === 'active' ? 'success' : 'neutral';
    }

    /**
     * Builds the card rows of a service: Active (state and since), Sub state, Unit file
     * (state and preset), Generated from or Path, then Triggered by, Result, Main PID and
     * Memory when they apply.
     *
     * @param {ServiceItem} item The service.
     * @returns {PropertyRow[]} The translated rows.
     */
    static serviceRows(item) {
        const activeState = ServicesModule.mapText(ServicesModule.ACTIVE_STATES, item.activeState);
        const unitFile = ServicesModule.mapText(ServicesModule.UNIT_FILE_STATES, item.unitFileState);
        /** @type {PropertyRow[]} */
        const rows = [
            {
                id: 'active',
                label: i18n("Active"),
                value: item.since
                    ? cockpit.format(i18n("$0 since $1"), activeState, formatCreated(item.since))
                    : activeState,
            },
            {id: 'sub-state', label: i18n("Sub state"), value: item.subState},
            {
                id: 'unit-file',
                label: i18n("Unit file"),
                value: item.preset
                    ? cockpit.format(i18n("$0 (preset: $1)"), unitFile, ServicesModule.mapText(ServicesModule.UNIT_FILE_STATES, item.preset))
                    : unitFile,
            },
        ];
        if (item.quadletFile) { rows.push({id: 'generated-from', label: i18n("Generated from"), value: item.quadletFile, mono: true}) } else { rows.push({id: 'path', label: i18n("Path"), value: item.path, mono: true}) }
        if (item.triggeredBy) { rows.push({id: 'triggered-by', label: i18n("Triggered by"), value: item.triggeredBy}) }
        if (item.result) { rows.push({id: 'result', label: i18n("Result"), value: item.result}) }
        if (item.mainPid) { rows.push({id: 'main-pid', label: i18n("Main PID"), value: String(item.mainPid)}) }
        if (item.memory) { rows.push({id: 'memory', label: i18n("Memory"), value: cockpit.format_bytes(item.memory)}) }
        return rows;
    }

    /**
     * Checks whether a service matches the filter text.
     *
     * @param {ServiceItem} item The service.
     * @param {string} query Lowercase filter text; empty matches all.
     * @returns {boolean} True when the unit name, description, sub state, a file path or the triggering unit contains the text.
     */
    static matchesFilter(item, query) {
        if (!query) { return true }
        const haystack = `${item.id} ${item.subtitle} ${item.subState} ${item.path} ${item.quadletFile || ''} ${item.triggeredBy || ''}`.toLowerCase();
        return haystack.includes(query);
    }

    /**
     * Builds the menu items after Copy: Show Quadlet (Quadlet services only), Show Unit and Show
     * status, a divider, then Show log and, for admins, Open log. Show Quadlet and Show Unit open
     * the same dialog on the Quadlet or the Unit view.
     *
     * @param {ServiceItem} item The service.
     * @param {ServicesPageState} state Page state, for the unit, status and log openers and the access mode.
     * @returns {(MenuItem|MenuDivider)[]} The menu items.
     */
    static cardActions(item, state) {
        const {openUnitView, setStatusService, setLogService} = state;
        const hasQuadlet = item.source === 'quadlet';
        /** @type {UnitView} */
        const base = {unit: item.id, initial: 'unit', hasQuadlet, unitPath: item.path, quadletPath: item.quadletFile};
        /** @type {(MenuItem|MenuDivider)[]} */
        const actions = [];
        if (hasQuadlet) { actions.push({key: 'quadlet', label: i18n("Show Quadlet"), onClick: () => openUnitView({...base, initial: 'quadlet'})}) }
        actions.push(
            {key: 'unit', label: i18n("Show Unit"), onClick: () => openUnitView(base)},
            {key: 'status', label: i18n("Show status"), onClick: () => setStatusService(item)},
            {key: 'log-divider', divider: true},
            {key: 'log', label: i18n("Show log"), onClick: () => setLogService(item)},
        );
        // Defensive: the page needs admin access, so this is always true while the menu is shown.
        if (state.mode === 'admin') { actions.push({key: 'open-log', label: i18n("Open log"), onClick: () => CockpitLinks.openServiceLog(item.id)}) }
        return actions;
    }

    /**
     * Returns the toolbar count text for the number of visible services.
     *
     * @param {number} count Number of visible items.
     * @returns {string} The translated count text, for example "3 services".
     */
    static countText(count) {
        return cockpit.format(cockpit.ngettext("$0 service", "$0 services", count), count);
    }

    /**
     * Closes the unit, status and log views, then loads the list again, for Refresh in a
     * not-found notice.
     *
     * @param {ServicesPageState} state Page state, for the close functions and refresh.
     */
    closeAndRefresh(state) {
        state.setStatusService(null);
        state.setLogService(null);
        super.closeAndRefresh(state);
    }

    /**
     * Builds the dialogs of the page: the unit view (Quadlet file and unit file), the status
     * view and the log view. Services have no Inspect view.
     *
     * @param {ServicesPageState} state Page state, for the open views and their close functions.
     * @returns {React.ReactElement} The dialogs.
     */
    dialogs(state) {
        const {closeUnitView} = state;
        const onRefresh = () => this.closeAndRefresh(state);
        return (
            <>
                <UnitViewModal view={state.unitView} onClose={closeUnitView} onRefresh={onRefresh}/>
                <ServiceStatusModal service={state.statusService} onClose={() => state.setStatusService(null)} onRefresh={onRefresh}/>
                <ServiceLogModal service={state.logService} admin={state.mode === 'admin'} onClose={() => state.setLogService(null)} onRefresh={onRefresh}/>
            </>
        );
    }

    /**
     * Builds a resource card for one service.
     *
     * @param {ServiceItem} item The service.
     * @param {ServicesPageState} state Page state, for the card menu actions.
     * @returns {React.ReactElement} The card, with key={item.id}.
     */
    card(item, state) {
        const Icon = this.icon;
        const label = ServicesModule.stateLabel(item);
        return (
            <ResourceCard
                key={item.id}
                id={this.cardDomId(item)}
                title={serviceDisplayName(item.title)}
                subtitle={item.subtitle === item.title ? serviceDisplayName(item.subtitle) : item.subtitle}
                icon={<Icon/>}
                status={label.text}
                statusVariant={label.variant}
                source={item.source}
                tone={ServicesModule.serviceTone(item)}
                rows={ServicesModule.serviceRows(item)}
                actions={ServicesModule.cardActions(item, state)}
            />
        );
    }
}

/**
 * Shared services module instance used by ServicesPage and the module list.
 *
 * @type {ServicesModule}
 */
export const servicesModule = new ServicesModule();
