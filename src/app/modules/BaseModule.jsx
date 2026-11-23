/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Base class for modules that show a filterable card grid (Containers, Images,
 * Volumes, Networks, Secrets, Services, Quadlets). Subclasses set their settings, including
 * the toolbar filter or filters, in the constructor, override card() and countText(), and
 * override any static helper they need to change. A module with other views
 * overrides dialogs() and closeAndRefresh(). Hooks stay in the page; this class
 * only builds the UI from ModulePageState. Items made by an installed Quadlet file get an
 * Uninstall item, which opens the shared Uninstall modal.
 *
 * @file BaseModule.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {Alert, AlertActionCloseButton} from '@patternfly/react-core/dist/esm/components/Alert';
import {SearchInput} from '@patternfly/react-core/dist/esm/components/SearchInput';
import {Toolbar, ToolbarContent, ToolbarItem} from '@patternfly/react-core/dist/esm/components/Toolbar';
import {Stack, StackItem} from '@patternfly/react-core/dist/esm/layouts/Stack';

import cockpit from '../utils/cockpitTyped.js';
import {i18n} from '../utils/i18n.js';
import {compareResources} from '../utils/compareResources.js';
import {isPodmanPageInstalled} from '../utils/isPodmanPageInstalled.js';
import {QuadletUninstall} from '../utils/QuadletUninstall.js';
import {resourceDisplayName} from '../utils/resourceName.js';

import {LoadingContent} from '../components/common/LoadingContent.jsx';
import {ResourceGrid} from '../components/resource/ResourceGrid.jsx';
import {FilterToggle} from '../components/resource/FilterToggle.jsx';
import {OpenInPodmanButton} from '../components/resource/OpenInPodmanButton.jsx';
import {ResourceViewModal} from '../components/modals/ResourceViewModal.jsx';
import {QuadletUninstallModal} from '../components/modals/QuadletUninstallModal.jsx';
import {UnitViewModal} from '../components/modals/UnitViewModal.jsx';

import {BaseFilter} from './filters/BaseFilter.js';

/** @typedef {import('../types/drop.js').UninstallTarget} UninstallTarget */
/** @typedef {import('../types/card.js').MenuDivider} MenuDivider */
/** @typedef {import('../types/card.js').MenuItem} MenuItem */
/** @typedef {import('../types/card.js').PropertyGroup} PropertyGroup */
/** @typedef {import('../types/card.js').PropertyRow} PropertyRow */
/** @typedef {import('../types/module.js').ModuleItem} ModuleItem */
/** @typedef {import('../types/resource.js').ResourceItem} ResourceItem */
/** @typedef {import('../types/resource.js').ResourceRow} ResourceRow */
/**
 * Page state of a module list, by item type.
 *
 * @template {ModuleItem} [I=ResourceItem] Item type of the list.
 * @typedef {import('../types/module.js').ModulePageState<I>} ModulePageState
 */

/**
 * Settings a module instance is built from, by item type.
 *
 * @template {ModuleItem} [I=ResourceItem] Item type of the list.
 * @typedef {import('../types/module.js').ModuleSettings<I>} ModuleSettings
 */

/**
 * Shared page layout and list helpers for card grid modules. Each subclass
 * constructs one shared instance, for example `export const containersModule = new ContainersModule()`,
 * and names its item type in its class doc, for example BaseModule<SecretItem>. Instance
 * methods take items of that type; the static helpers take any ModuleItem, or any
 * ResourceItem when they read resource fields such as rows or groups.
 *
 * @template {ModuleItem} [T=ResourceItem] Item type of the module list.
 */
export class BaseModule {
    /**
     * Builds a resource module from its settings and stores them on the instance.
     *
     * @param {ModuleSettings<T>} settings Module id, labels, action, filter and display settings.
     */
    constructor(settings) {
        this.id = settings.id;
        this.label = settings.label;
        this.action = settings.action;
        this.kind = settings.kind;
        /** @type {BaseFilter<T>[]} */
        this.filters = BaseFilter.list(settings.filter);
        /** @type {BaseFilter<T>} */
        this.filter = this.filters[0];
        this.emptyTitle = settings.emptyTitle;
        this.emptyBody = settings.emptyBody;
        this.idPrefix = settings.idPrefix;
        this.icon = settings.icon;
        this.variables = settings.variables === true;
        this.showOpenInPodman = settings.showOpenInPodman === true;
        this.quadletView = settings.quadletView !== false;
    }

    /**
     * Ids of the row groups whose row labels are fixed words from the API, so
     * cardGroups() translates them. Rows of other groups stay as given, for
     * example names used as labels. The default translates no group rows.
     *
     * @type {Set<string>}
     */
    static TRANSLATED_GROUPS = new Set();

    /**
     * Returns the value of a named row, or an empty string when the row is missing.
     *
     * @param {ResourceItem} item The resource.
     * @param {string} rowId Row id to look up.
     * @returns {string} The row value, or an empty string.
     */
    static rowText(item, rowId) {
        const row = (item.rows || []).find(entry => entry.id === rowId);
        return row?.value ? String(row.value) : '';
    }

    /**
     * Checks whether a resource matches the filter text. The default looks at the
     * id, title and subtitle. A subclass that needs other fields, such as an image
     * URL or a volume mount-point, overrides this static method.
     *
     * @param {ModuleItem} item The resource.
     * @param {string} query Lowercase filter text; empty matches all.
     * @returns {boolean} True when the resource matches the text.
     */
    static matchesFilter(item, query) {
        if (!query) {
            return true;
        }
        const haystack = `${item.id} ${item.title} ${item.subtitle || ''}`.toLowerCase();
        return haystack.includes(query);
    }

    /**
     * Returns a new array of resources sorted with compareResources: built-in
     * ones first, then all by title, A to Z.
     *
     * @template {ModuleItem} I Item type.
     * @param {I[]} items The resources to sort.
     * @returns {I[]} A new sorted array; the input is not changed.
     */
    static sortItems(items) {
        return items.slice().sort(compareResources);
    }

    /**
     * Returns the inspect name or ID of a resource, passed to viewActions.
     * The default is item.id. Images override this to prefer item.fullId.
     *
     * @param {ResourceItem} item The resource.
     * @returns {string} The ref passed to the inspect action.
     */
    static inspectRef(item) {
        return item.id;
    }

    /**
     * Builds the Inspect (and Variables) kebab items for a resource, using the
     * opener from page state. The menu items themselves come from useResourceView,
     * so this method does not rebuild them.
     *
     * @param {ResourceItem} item The resource.
     * @param {ModulePageState} state Page state, for the hook's viewActions builder.
     * @returns {MenuItem[]} Inspect, and Variables when the hook was created with variables: true.
     */
    static viewActions(item, state) {
        return state.viewActions(this.inspectRef(item), resourceDisplayName(item));
    }

    /**
     * Builds the Show Quadlet kebab items for a resource, using the opener from
     * page state. Stays static because the items come from useUnitView, not from
     * module settings.
     *
     * @param {ResourceItem} item The resource.
     * @param {ModulePageState} state Page state, for the hook's quadletActions builder.
     * @returns {(MenuItem|MenuDivider)[]} The menu items, or an empty array.
     */
    static quadletActions(item, state) {
        return state.quadletActions(item);
    }

    /**
     * Builds the Uninstall kebab items of a target: a divider and Uninstall, which opens the
     * shared modal. Nothing when the target is null or PodShift does not offer quadlet-remove.
     * Uninstall is disabled while the removal of the same target was queued a short while ago
     * (state.isUninstallQueued), so it cannot be queued twice.
     *
     * @param {UninstallTarget|null} target What Uninstall removes, from QuadletUninstall.
     * @param {ModulePageState<any>} state Page state, for canUse and the modal opener.
     * @returns {(MenuItem|MenuDivider)[]} The menu items, or an empty array.
     */
    static uninstallItems(target, state) {
        if (!target || !state.canUse('quadlet-remove')) { return [] }
        return [
            {key: 'uninstall-divider', divider: true},
            {key: 'uninstall', label: i18n("Uninstall"), isDisabled: state.isUninstallQueued(target), onClick: () => state.openUninstall(target)},
        ];
    }

    /**
     * Builds the Uninstall kebab items of a resource: only for an item with the quadlet field,
     * which PodShift sets for containers, volumes and networks made by an installed Quadlet file.
     *
     * @param {ResourceItem} item The resource.
     * @param {ModulePageState} state Page state, for canUse and the modal opener.
     * @returns {(MenuItem|MenuDivider)[]} The menu items, or an empty array.
     */
    static uninstallActions(item, state) {
        return this.uninstallItems(QuadletUninstall.fromResource(item), state);
    }

    /**
     * Builds the full kebab action list of a resource card: Inspect (and Variables),
     * then Show Quadlet when the resource has a Quadlet unit, then Uninstall when an installed
     * Quadlet file made it.
     *
     * @param {ResourceItem} item The resource.
     * @param {ModulePageState} state Page state, for the hook action builders.
     * @returns {(MenuItem|MenuDivider)[]} The menu items.
     */
    static cardActions(item, state) {
        return [...this.viewActions(item, state), ...this.quadletActions(item, state), ...this.uninstallActions(item, state)];
    }

    /**
     * Translates the label of a row in a translated group. Volumes override this
     * to translate fixed values too.
     *
     * @param {ResourceRow} row The row from the API.
     * @returns {PropertyRow} The row ready for display.
     */
    static translateGroupRow(row) {
        return {...row, label: i18n(row.label)};
    }

    /**
     * Translates the group labels of a resource, and the rows of the groups in
     * TRANSLATED_GROUPS with translateGroupRow(). Containers override this to
     * translate every group row.
     *
     * @param {ResourceItem} item The resource.
     * @returns {PropertyGroup[]} The groups ready for display.
     */
    static cardGroups(item) {
        return (item.groups || []).map(group => ({
            ...group,
            label: i18n(group.label),
            rows: this.TRANSLATED_GROUPS.has(group.id)
                ? (group.rows || []).map(row => this.translateGroupRow(row))
                : (group.rows || [])
        }));
    }

    /**
     * Returns the resource list from the page state, or null when it has not loaded.
     *
     * @template {ModuleItem} I Item type.
     * @param {ModulePageState<I>} state Page state from the hooks.
     * @returns {I[]|null} The items, or null before the first successful load.
     */
    static listItems(state) {
        if (state.data && Array.isArray(state.data.items)) {
            return state.data.items;
        }
        return null;
    }

    /**
     * Returns the toolbar count text for the number of visible items.
     * Subclasses must override this with a cockpit.ngettext() call that uses
     * literal strings, so xgettext can extract them.
     *
     * @abstract
     * @param {number} count Number of visible items.
     * @returns {string} The translated count text, for example "3 containers".
     * @throws {Error} When the subclass has not implemented it.
     */
    static countText(count) {
        throw new Error(`${BaseModule.#className(this)}.countText(${count}) must be implemented`);
    }

    /**
     * Returns the resources that pass every toggle filter and match the search
     * text, then sorted. this.filters are the toolbar toggles; this.constructor
     * gives matchesFilter and sortItems, so a subclass can override those statics.
     *
     * @param {T[]} items The unfiltered list, or an empty array when none has loaded.
     * @param {string} query Lowercase filter text; empty matches all.
     * @param {string[]} filterValues Selected option id of each toggle filter, in the same order as this.filters.
     * @returns {T[]} The visible items, in display order.
     */
    visibleItems(items, query, filterValues) {
        const ModuleClass = this.#moduleClass();
        const visible = items.filter(item => this.filters.every((toggle, index) => toggle.matches(item, filterValues[index])) &&
            ModuleClass.matchesFilter(item, query));
        return ModuleClass.sortItems(visible);
    }

    /**
     * Returns the DOM id of a resource card: this.idPrefix plus the item id.
     * Containers override this to use the title, which is the container name.
     *
     * @param {ModuleItem} item The resource.
     * @returns {string} The element id, for example 'podshift-volume-data'.
     */
    cardDomId(item) {
        return this.idPrefix + item.id;
    }

    /**
     * Builds the resource card for one item. Subclasses must override this.
     *
     * @abstract
     * @param {T & ModuleItem} item The resource.
     * @param {ModulePageState<T>} state Page state, for the card menu actions.
     * @returns {React.ReactElement} The card, with key={item.id}.
     * @throws {Error} When the subclass has not implemented it.
     */
    card(item, state) { // eslint-disable-line no-unused-vars
        throw new Error(`${BaseModule.#className(this.constructor)}.card() must be implemented for ${item.id}`);
    }

    /**
     * Closes the open views and loads the list again, for Refresh in a not-found
     * notice. The default closes the Inspect and unit views. A module with more
     * views overrides this, closes them and calls super.closeAndRefresh(state).
     *
     * @param {ModulePageState<T>} state Page state, for the close functions and refresh.
     */
    closeAndRefresh(state) {
        state.closeView();
        state.closeUnitView();
        state.refresh().catch(() => {
        });
    }

    /**
     * Builds the shared Uninstall modal. After a removal is queued the page shows a notice and
     * loads the list again (useModulePage).
     *
     * @param {ModulePageState<T>} state Page state, for the open target and its callbacks.
     * @returns {React.ReactElement} The modal, which renders nothing while no target is open.
     */
    uninstallDialog(state) {
        const {uninstall, closeUninstall, uninstallQueued} = state;
        return <QuadletUninstallModal target={uninstall} onClose={closeUninstall} onQueued={uninstallQueued}/>;
    }

    /**
     * Builds the dialogues of the page. The default is the Inspect view modal, the Uninstall
     * modal and, unless quadletView is off, the Quadlet view modal. A module with other views
     * overrides this and keeps uninstallDialog() when its cards offer Uninstall.
     *
     * @param {ModulePageState<T>} state Page state, for the open views and their close functions.
     * @returns {React.ReactElement} The dialogues.
     */
    dialogs(state) {
        const {closeView, closeUnitView, refresh} = state;

        let unitViewModal = null;
        if (this.quadletView) {
            unitViewModal = (
                <UnitViewModal
                    view={state.unitView}
                    onClose={closeUnitView}
                    onRefresh={() => this.closeAndRefresh(state)}
                />
            );
        }

        return (
            <>
                <ResourceViewModal kind={this.kind} view={state.view} onClose={closeView} onRefresh={refresh}/>
                {unitViewModal}
                {this.uninstallDialog(state)}
            </>
        );
    }

    /**
     * Builds the shared page: toolbar, loading states, card grid and the dialogues
     * from dialogs().
     *
     * @param {ModulePageState<T>} state Page state from the hooks.
     * @returns {React.ReactElement} The page content.
     */
    render(state) {
        const resources = BaseModule.listItems(state);
        const query = state.filter.trim().toLowerCase();
        const items = this.visibleItems(resources || [], query, state.filterValues);

        return (
            <Stack style={{rowGap: 'var(--pf-t--global--spacer--lg)'}}>
                {this.#toolbar(state, resources, items)}
                {this.#uninstallNotice(state)}
                <LoadingContent
                    unavailable={state.unavailable}
                    loading={state.loading}
                    error={state.error}
                    hasData={resources != null}
                    isEmpty={items.length === 0}
                    emptyTitle={this.emptyTitle}
                    emptyBody={this.emptyBody}
                    spinnerSize="lg"
                    warningPlacement="stack"
                >
                    <ResourceGrid>
                        {this.#cards(items, state)}
                    </ResourceGrid>
                </LoadingContent>
                {this.dialogs(state)}
            </Stack>
        );
    }

    /**
     * Builds the notice shown after an uninstall was queued, until it is closed.
     *
     * @param {ModulePageState<T>} state Page state, for the queued target and the close function.
     * @returns {React.ReactElement|null} The notice, wrapped in a StackItem, or null.
     */
    #uninstallNotice(state) {
        const {uninstallNotice: target, dismissUninstallNotice} = state;
        if (!target) { return null }
        const title = target.isApp
            ? cockpit.format(i18n("Uninstall of app $0 is queued"), target.name)
            : cockpit.format(i18n("Uninstall of $0 is queued"), target.name);
        return (
            <StackItem>
                <Alert
                    variant="success"
                    isInline
                    title={title}
                    actionClose={<AlertActionCloseButton onClose={dismissUninstallNotice}/>}
                >
                    {i18n("The list loads again shortly. The install log on the Drop Quadlet tab shows the progress.")}
                </Alert>
            </StackItem>
        );
    }

    /**
     * Returns this instance's class, typed as BaseModule so overridable statics
     * are visible when called through this.constructor.
     *
     * @returns {typeof BaseModule} The class of this instance.
     */
    #moduleClass() {
        return /** @type {typeof BaseModule} */ (this.constructor);
    }

    /**
     * Returns the name of a module class, for error messages.
     * String() keeps the return a string, since WebStorm does not type the built-in class name as one.
     *
     * @param {Function} moduleClass The module class, for example ContainersModule.
     * @returns {string} The class name.
     */
    static #className(moduleClass) {
        return String(moduleClass.name);
    }

    /**
     * Builds the page toolbar: search, the toggle filters, optional Open in Podman,
     * and the visible-item count once the list has loaded.
     *
     * @param {ModulePageState<T>} state Page state from the hooks.
     * @param {T[]|null} resources The loaded list, or null before the first load.
     * @param {T[]} items The visible, filtered items.
     * @returns {React.ReactElement} The toolbar, wrapped in a StackItem.
     */
    #toolbar(state, resources, items) {
        const {filter, setFilter, unavailable} = state;
        const ModuleClass = this.#moduleClass();

        let podmanItem = null;
        if (this.showOpenInPodman && isPodmanPageInstalled()) {
            podmanItem = (
                <ToolbarItem>
                    <OpenInPodmanButton/>
                </ToolbarItem>
            );
        }

        let countItem = null;
        if (resources != null) {
            countItem = (
                <ToolbarItem align={{default: 'alignEnd'}}>
                    {ModuleClass.countText(items.length)}
                </ToolbarItem>
            );
        }

        return (
            <StackItem>
                <Toolbar>
                    <ToolbarContent>
                        <ToolbarItem variant="search-filter">
                            <SearchInput
                                placeholder={i18n("Filter")}
                                value={filter}
                                onChange={(_event, value) => setFilter(value)}
                                onClear={() => setFilter('')}
                                isDisabled={!!unavailable}
                            />
                        </ToolbarItem>
                        {this.#filterItems(state)}
                        {podmanItem}
                        {countItem}
                    </ToolbarContent>
                </Toolbar>
            </StackItem>
        );
    }

    /**
     * Builds one toolbar item per toggle filter, in module filter order.
     *
     * @param {ModulePageState<T>} state Page state, for the selected options and the disabled flag.
     * @returns {React.ReactElement[]} The filter toolbar items.
     */
    #filterItems(state) {
        const {filterValues, setFilterValue, unavailable} = state;
        return this.filters.map((toggle, index) => (
            <ToolbarItem key={toggle.idPrefix}>
                <FilterToggle
                    filter={toggle}
                    value={filterValues[index]}
                    onChange={id => setFilterValue(index, id)}
                    isDisabled={!!unavailable}
                />
            </ToolbarItem>
        ));
    }

    /**
     * Builds the resource cards for the visible items, each from card().
     *
     * @param {T[]} items Visible resources.
     * @param {ModulePageState<T>} state Page state, for the card menu actions.
     * @returns {React.ReactElement[]} The cards.
     */
    #cards(items, state) {
        return items.map(item => this.card(item, state));
    }
}
