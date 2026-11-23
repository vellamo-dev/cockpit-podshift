/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Hook that gathers the action, search, toggle filters and view state a resource
 * module page passes to BaseModule.render().
 *
 * @file useModulePage.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {useCallback, useEffect, useState} from 'react';

import cockpit from '../utils/cockpitTyped.js';
import {i18n} from '../utils/i18n.js';
import {BaseFilter} from '../modules/filters/BaseFilter.js';
import {hasCapability} from '../utils/capabilities.js';
import {QuadletUninstall} from '../utils/QuadletUninstall.js';
import {UninstallGuard} from '../utils/UninstallGuard.js';
import {UninstallRefresh} from '../utils/UninstallRefresh.js';

import {useAction} from './useAction.js';
import {useAutoRefresh} from './AutoRefreshContext.js';
import {useCapabilities} from './CapabilitiesContext.js';
import {useResourceView} from './useResourceView.js';
import {useUnitView} from './useUnitView.js';

/** @typedef {import('../types/api.js').ActionState} ActionState */
/** @typedef {import('../types/module.js').ModuleItem} ModuleItem */
/** @typedef {import('../types/drop.js').UninstallTarget} UninstallTarget */
/** @typedef {import('../types/module.js').ModuleProps} ModuleProps */
/**
 * Settings a module instance is built from, by item type.
 *
 * @template {ModuleItem} [I=import('../types/resource.js').ResourceItem] Item type of the list.
 * @typedef {import('../types/module.js').ModuleSettings<I>} ModuleSettings
 */
/**
 * Page state of a module list, by item type.
 *
 * @template {ModuleItem} [I=import('../types/resource.js').ResourceItem] Item type of the list.
 * @typedef {import('../types/module.js').ModulePageState<I>} ModulePageState
 */

/**
 * Reads the search text from the page address, if any.
 *
 * @returns {string} The filter option, or an empty string when it is missing.
 */
function readLocationFilter() {
    const value = cockpit.location.options.filter;
    if (typeof value === 'string') {
        return value;
    }
    if (Array.isArray(value) && typeof value[0] === 'string') {
        return value[0];
    }
    return '';
}

/**
 * Gathers the hooks a resource module page needs into one state object for
 * BaseModule.render(). The module argument only needs action, filter and
 * variables, so a BaseModule instance can be passed as is. Each toggle filter
 * starts on its default option. The hook always requires admin access,
 * like the Containers, Images, Volumes, Networks, Secrets and Services pages.
 * A filter option in the page address pre-fills the search box.
 * It also holds the Uninstall modal and notice. After a removal is queued the list loads at once
 * and the header auto refresh turns on for UninstallRefresh.FOR_MS (2 minutes), polling on the
 * UninstallRefresh steps, as the removal itself runs a little later in the podshift-qdl-remove
 * service. It turns off once the list no longer has an item of that target. Auto refresh turned
 * on with the toggle polls every UninstallRefresh.MANUAL_MS. On a tab without the toggle nothing
 * polls.
 * A queued target keeps its Uninstall item disabled for UninstallGuard.HOLD_MS, so the same
 * removal cannot be queued twice; the page renders again when that time ends.
 *
 * @template {ModuleItem} T Item type of the list.
 * @param {Pick<ModuleSettings<T>, 'action'|'filter'|'variables'>} module The module, for its action name, toggle filter and Variables option.
 * @param {ModuleProps} props Page props, for the access mode.
 * @returns {ModulePageState<T>} The state the page passes to render().
 */
export function useModulePage(module, props) {
    const {mode} = props;
    const admin = mode === 'admin';
    const filters = BaseFilter.list(module.filters || module.filter);
    const [filter, setFilterState] = useState(readLocationFilter);
    useEffect(() => {
        /**
         * Applies the search text from the page address.
         */
        function onChange() {
            setFilterState(readLocationFilter());
        }

        cockpit.addEventListener('locationchanged', onChange);
        return () => cockpit.removeEventListener('locationchanged', onChange);
    }, []);
    const setFilter = useCallback(
        /**
         * Sets the search text. An empty value also removes the filter from the page address.
         *
         * @param {string} value Search text.
         */
        function setSearch(value) {
            setFilterState(value);
            if (value === '' && cockpit.location.options.filter) {
                cockpit.location.go(cockpit.location.path);
            }
        },
        []
    );
    const [filterValues, setFilterValues] = useState(() => filters.map(toggle => toggle.defaultValue));
    const setFilterValue = useCallback(
        /**
         * Sets the selected option of one toggle filter.
         *
         * @param {number} index Filter index, in module filter order.
         * @param {string} id Selected option id.
         */
        function setValue(index, id) {
            setFilterValues(current => current.map((value, i) => (i === index ? id : value)));
        },
        []
    );
    const {view, viewActions, closeView} = useResourceView({variables: module.variables === true});
    const {unitView, openUnitView, quadletActions, closeUnitView} = useUnitView();
    const {startedAt: autoStartedAt, start: startAuto, stop: stopAuto} = useAutoRefresh();
    const autoActive = autoStartedAt !== null;
    const [uninstalling, setUninstalling] = useState(/** @type {{name: string, at: number}|null} */ (null));
    const uninstallAt = uninstalling ? uninstalling.at : 0;
    const poll = useCallback(function listPoll() {
        return UninstallRefresh.pollDelay(autoActive, uninstallAt ? Date.now() - uninstallAt : NaN);
    }, [autoActive, uninstallAt]);
    /** @type {ActionState<import('../types/module.js').ModuleList<T>>} */
    const {data, error, loading, refresh} = useAction(module.action, {enabled: admin, poll});
    const unavailable = admin ? null : i18n("Requires administrative access");
    const caps = useCapabilities();
    const canUse = useCallback(action => hasCapability(caps, action), [caps]);
    const [uninstall, setUninstall] = useState(/** @type {UninstallTarget|null} */ (null));
    const [uninstallNotice, setUninstallNotice] = useState(/** @type {UninstallTarget|null} */ (null));
    useEffect(function endUninstallRefresh() {
        if (!uninstalling) { return }
        if (!autoActive) {
            setUninstalling(null);
            return;
        }
        const items = data?.items;
        if (Array.isArray(items) && !QuadletUninstall.listHas(items, uninstalling.name)) {
            setUninstalling(null);
            stopAuto();
        }
    }, [uninstalling, autoActive, data, stopAuto]);
    const openUninstall = useCallback(target => setUninstall(target), []);
    const closeUninstall = useCallback(() => setUninstall(null), []);
    const [guardTick, setGuardTick] = useState(0);
    useEffect(function renderWhenGuardEnds() {
        const wait = UninstallGuard.msUntilNextEnd(Date.now());
        if (wait === null) { return undefined }
        const timer = window.setTimeout(() => setGuardTick(tick => tick + 1), wait);
        return () => window.clearTimeout(timer);
    }, [guardTick]);
    const dismissUninstallNotice = useCallback(() => setUninstallNotice(null), []);
    const uninstallQueued = useCallback(
        /**
         * Closes the modal, shows the queued notice, loads the list now and turns auto refresh on
         * for 2 minutes. The target keeps its Uninstall item disabled for a while (UninstallGuard).
         *
         * @param {UninstallTarget} target What was queued for removal.
         */
        function onQueued(target) {
            setUninstall(null);
            UninstallGuard.mark(target.name, Date.now());
            setGuardTick(tick => tick + 1);
            setUninstallNotice(target);
            refresh().catch(() => {});
            setUninstalling({name: target.name, at: Date.now()});
            startAuto(UninstallRefresh.FOR_MS);
        },
        [refresh, startAuto]
    );

    /**
     * Tells whether the removal of a target was queued a short while ago, so its Uninstall item is disabled.
     *
     * @param {UninstallTarget} target What Uninstall removes.
     * @returns {boolean} True while the item stays disabled.
     */
    function isUninstallQueued(target) {
        return UninstallGuard.isQueued(target.name, Date.now());
    }

    return {
        data,
        error,
        loading,
        unavailable,
        mode,
        filter,
        setFilter,
        filterValues,
        setFilterValue,
        refresh,
        view,
        viewActions,
        closeView,
        unitView,
        openUnitView,
        quadletActions,
        closeUnitView,
        canUse,
        uninstall,
        openUninstall,
        closeUninstall,
        uninstallQueued,
        isUninstallQueued,
        uninstallNotice,
        dismissUninstallNotice,
    };
}
