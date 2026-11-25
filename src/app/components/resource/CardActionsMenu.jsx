/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Kebab menu for a card header, using Cockpit's shared KebabDropdown.
 * Icons are taken from the item key via menuItemIcon, so every menu shows the same
 * icon for the same action.
 *
 * @file CardActionsMenu.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {Divider} from '@patternfly/react-core/dist/esm/components/Divider';
import {DropdownItem} from '@patternfly/react-core/dist/esm/components/Dropdown';

import {KebabDropdown} from 'cockpit-components-dropdown';

import {menuItemIcon, menuItemIsDanger} from './menuItemIcon.js';

/** @typedef {import('../../types/card.js').MenuItem} MenuItem */
/** @typedef {import('../../types/card.js').MenuDivider} MenuDivider */

/**
 * Builds one kebab entry: a separator, or a labelled item with its icon.
 *
 * @param {MenuItem|MenuDivider} item The menu item or divider.
 * @returns {React.ReactElement} The dropdown entry.
 */
function dropdownEntry(item) {
    if ('divider' in item) {
        return <Divider key={item.key} component="li"/>;
    }
    const Icon = menuItemIcon(item.key);
    return (
        <DropdownItem
            key={item.key}
            icon={Icon ? <Icon/> : undefined}
            isDanger={menuItemIsDanger(item.key)}
            onClick={() => item.onClick()}
            isDisabled={item.isDisabled}
            isSelected={item.isSelected}
        >
            {item.label}
        </DropdownItem>
    );
}

/**
 * Shows a kebab menu with one entry per item; a divider item shows a separator line.
 *
 * @param {object} props Component props.
 * @param {(MenuItem|MenuDivider)[]} [props.items] Menu items and dividers, in display order.
 * @returns {React.ReactElement} The kebab menu.
 */
export function CardActionsMenu({items = []}) {
    return (
        <KebabDropdown
            position="right"
            dropdownItems={items.map(item => dropdownEntry(item))}
        />
    );
}
