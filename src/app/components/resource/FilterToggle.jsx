/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Filter toggle group of the resource modules, built from a BaseFilter: its options, aria label and button ids.
 *
 * @file FilterToggle.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {ToggleGroup, ToggleGroupItem} from '@patternfly/react-core/dist/esm/components/ToggleGroup';

/** @typedef {import('../../types/filter.js').FilterOption} FilterOption */
/** @typedef {import('../../modules/filters/BaseFilter.js').BaseFilter<object>} AnyFilter */

/**
 * One toggle in the filter group.
 *
 * @param {FilterOption} option The option.
 * @param {string} idPrefix Prefix of the button id.
 * @param {string} value The selected option id.
 * @param {boolean} isDisabled True when the toggles are disabled.
 * @param {(id: string) => void} onChange Called with the option id when the user selects it.
 * @returns {React.ReactElement} The toggle item.
 */
function filterToggleItem(option, idPrefix, value, isDisabled, onChange) {
    const Icon = option.Icon;
    return (
        <ToggleGroupItem
            key={option.id}
            text={option.label}
            icon={Icon ? <Icon/> : undefined}
            buttonId={idPrefix + option.id}
            isSelected={value === option.id}
            isDisabled={isDisabled}
            onChange={() => onChange(option.id)}
        />
    );
}

/**
 * Shows a PatternFly ToggleGroup of the filter's options, labelled with the filter's
 * aria label. Each button id is the filter's idPrefix plus the option id, for
 * example "podshift-container-source-all" or "podshift-secret-usage-unused".
 *
 * @param {object} props Component props.
 * @param {AnyFilter} props.filter The filter, for its options, aria label and id prefix.
 * @param {string} props.value The selected option id.
 * @param {(id: string) => void} props.onChange Called with the option id when the user selects it.
 * @param {boolean} [props.isDisabled] True when the toggles are disabled.
 * @returns {React.ReactElement} The toggle group.
 */
export function FilterToggle({filter, value, onChange, isDisabled = false}) {
    return (
        <ToggleGroup aria-label={filter.label}>
            {filter.options().map(option => filterToggleItem(option, filter.idPrefix, value, isDisabled, onChange))}
        </ToggleGroup>
    );
}
