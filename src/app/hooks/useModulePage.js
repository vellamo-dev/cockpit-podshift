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

import {useAction} from './useAction.js';
import {useResourceView} from './useResourceView.js';
import {useUnitView} from './useUnitView.js';

/** @typedef {import('../types/api.js').ActionState} ActionState */
/** @typedef {import('../types/module.js').ModuleItem} ModuleItem */
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
    /** @type {ActionState<import('../types/module.js').ModuleList<T>>} */
    const {data, error, loading, refresh} = useAction(module.action, {enabled: admin});
    const unavailable = admin ? null : i18n("Requires administrative access");

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
    };
}
