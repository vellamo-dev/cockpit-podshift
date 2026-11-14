/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Kebab menu for a card header, using Cockpit's shared KebabDropdown.
 *
 * @file CardActionsMenu.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {Divider} from '@patternfly/react-core/dist/esm/components/Divider';
import {DropdownItem} from '@patternfly/react-core/dist/esm/components/Dropdown';

import {KebabDropdown} from 'cockpit-components-dropdown';

/** @typedef {import('../../types/card.js').MenuItem} MenuItem */
/** @typedef {import('../../types/card.js').MenuDivider} MenuDivider */

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
            dropdownItems={items.map(item => ('divider' in item
                ? <Divider key={item.key} component="li"/>
                : (
                    <DropdownItem
                        key={item.key}
                        onClick={() => item.onClick()}
                        isDisabled={item.isDisabled}
                    >
                        {item.label}
                    </DropdownItem>
                )
            ))}
        />
    );
}
