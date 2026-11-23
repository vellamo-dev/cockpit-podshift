/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Hook that keeps the one open unit view of a tab (Quadlet file and generated unit) and builds
 * the Show Quadlet menu item of Quadlet resource cards.
 *
 * @file useUnitView.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {useCallback, useState} from 'react';

import {i18n} from '../utils/i18n.js';
import {ResourceSource} from '../utils/ResourceSource.js';
import {useCapability} from './CapabilitiesContext.js';

/** @typedef {import('../types/card.js').MenuDivider} MenuDivider */
/** @typedef {import('../types/card.js').MenuItem} MenuItem */
/** @typedef {import('../types/resource.js').ResourceItem} ResourceItem */
/** @typedef {import('../types/service.js').UnitView} UnitView */
/** @typedef {import('../types/service.js').UnitViewState} UnitViewState */

/**
 * Service unit names the handler accepts, the same check as its input contract.
 *
 * @type {RegExp}
 */
const SERVICE_UNIT = /^[A-Za-z0-9:_@]([A-Za-z0-9:_.@-]|\\x[0-9a-f]{2})*\.service$/;

/**
 * Checks whether a name is a service unit the handler accepts.
 *
 * @param {string} [unit] Unit name.
 * @returns {boolean} True when the name is a valid .service unit.
 */
export function isServiceUnit(unit) {
    return typeof unit === 'string' && SERVICE_UNIT.test(unit);
}

/**
 * Keeps the open unit view of a tab. Opening a view replaces the one before, so only one is open.
 *
 * @returns {UnitViewState} The open view, open and close functions, and the Show Quadlet item builder.
 */
export function useUnitView() {
    const [unitView, setUnitView] = useState(/** @type {UnitView|null} */ (null));
    const canQuadletView = useCapability('quadlet-view');

    const openUnitView = useCallback(
        /**
         * Opens a unit view.
         *
         * @param {UnitView} view The view to open.
         */
        function open(view) {
            setUnitView(view);
        },
        []
    );

    const quadletActions = useCallback(
        /**
         * Builds a divider and Show Quadlet for a card with the Quadlet source and a service unit
         * in its systemd group; other cards get nothing, and nothing without the quadlet-view action.
         *
         * @param {ResourceItem} item The resource.
         * @returns {(MenuItem|MenuDivider)[]} The menu items.
         */
        function build(item) {
            const unit = ResourceSource.sourceUnitFromGroups(item.groups);
            if (!canQuadletView || item.source !== 'quadlet' || !isServiceUnit(unit)) { return [] }
            return [
                {key: 'quadlet-divider', divider: true},
                {
                    key: 'quadlet',
                    label: i18n("Show Quadlet"),
                    onClick: () => setUnitView({unit, initial: 'quadlet', hasQuadlet: true}),
                },
            ];
        },
        [canQuadletView]
    );

    const closeUnitView = useCallback(() => setUnitView(null), []);

    return {unitView, openUnitView, quadletActions, closeUnitView};
}
