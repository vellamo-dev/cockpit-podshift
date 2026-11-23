/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Hook that keeps the one open code view of a resource tab (Inspect or Variables)
 * and builds the card menu items that open it.
 *
 * @file useResourceView.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {useCallback, useState} from 'react';

import {i18n} from '../utils/i18n.js';
import {useCapability} from './CapabilitiesContext.js';

/** @typedef {import('../types/card.js').MenuItem} MenuItem */
/** @typedef {import('../types/inspect.js').ResourceView} ResourceView */
/** @typedef {import('../types/inspect.js').ResourceViewState} ResourceViewState */

/**
 * Keeps the open view of a tab. Opening a view replaces the one before, so only one is open.
 * Inspect and Variables both read the inspect action, so neither is offered when PodShift lacks it.
 *
 * @param {object} [options] Hook options.
 * @param {boolean} [options.variables] True adds a Variables item after Inspect (containers).
 * @returns {ResourceViewState} The open view, a menu item builder and a close function.
 */
export function useResourceView({variables = false} = {}) {
    const [view, setView] = useState(/** @type {ResourceView|null} */ (null));
    const canInspect = useCapability('inspect');

    const viewActions = useCallback(
        /**
         * Builds the menu items that open the views of one resource; ResourceCard puts them after Copy.
         *
         * @param {string} ref Name or ID passed to the inspect action.
         * @param {string} name Resource name, shown in the title.
         * @returns {MenuItem[]} Inspect, and Variables when enabled; nothing without the inspect action.
         */
        function build(ref, name) {
            if (!canInspect) { return [] }
            const items = [
                {key: 'inspect', label: i18n("Inspect"), onClick: () => setView({mode: 'inspect', ref, name})},
            ];
            if (variables) { items.push({key: 'variables', label: i18n("Variables"), onClick: () => setView({mode: 'variables', ref, name})}) }
            return items;
        },
        [variables, canInspect]
    );

    const closeView = useCallback(() => setView(null), []);

    return {view, viewActions, closeView};
}
