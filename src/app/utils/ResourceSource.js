/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Resource sources (quadlet, container, unit, unmanaged, built-in) and their labels, colours and icons.
 * The unmanaged source is labelled "Manual" in the UI; its key stays unmanaged, as the handler sends it.
 *
 * @file ResourceSource.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {i18n} from './i18n.js';
import {CogIcon} from '@patternfly/react-icons/dist/esm/icons/cog-icon';
import {CubesIcon} from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import {FileCodeIcon} from '@patternfly/react-icons/dist/esm/icons/file-code-icon';
import {LockIcon} from '@patternfly/react-icons/dist/esm/icons/lock-icon';
import {UnlinkIcon} from '@patternfly/react-icons/dist/esm/icons/unlink-icon';

/** @typedef {import('../types/resource.js').ResourceSource} SourceInfo */
/** @typedef {import('../types/resource.js').ResourceSourceId} ResourceSourceId */
/** @typedef {import('../types/card.js').PropertyGroup} PropertyGroup */
/** @typedef {import('../types/resource.js').ResourceRowGroup} ResourceRowGroup */
/** @typedef {import('../types/resource.js').SourceFilterOption} SourceFilterOption */

/**
 * Resource sources and their labels, colours and icons.
 * All members are static; this class is not constructed.
 */
export class ResourceSource {
    /**
     * Where a resource comes from, with its PF Label colour and icon. Order is the filter order.
     * hasUnit: the tooltip also names the systemd unit. description: the tooltip text instead of the label.
     *
     * @type {SourceInfo[]}
     */
    static RESOURCE_SOURCES = [
        {id: 'quadlet', label: i18n("Quadlet"), color: 'blue', Icon: FileCodeIcon, hasUnit: true},
        {id: 'container', label: i18n("Container"), color: 'teal', Icon: CubesIcon, hasUnit: true},
        {id: 'unit', label: i18n("Unit"), color: 'purple', Icon: CogIcon, hasUnit: true},
        {
            id: 'unmanaged',
            label: i18n("Manual"),
            description: i18n("Created by hand, not managed by systemd or Quadlet."),
            color: 'orange',
            Icon: UnlinkIcon,
            hasUnit: false
        },
        {id: 'builtin', label: i18n("Built-in"), color: 'grey', Icon: LockIcon, hasUnit: false},
    ];

    /**
     * Builds the source filter options for a tab: All, then the given sources in RESOURCE_SOURCES order.
     *
     * @param {ResourceSourceId[]} ids Source keys the tab supports.
     * @returns {SourceFilterOption[]} The filter options.
     */
    static sourceFilterOptions(ids) {
        const allowed = new Set(ids);
        return [
            {id: 'all', label: i18n("All")},
            ...ResourceSource.RESOURCE_SOURCES.filter(source => allowed.has(source.id))
        ];
    }

    /**
     * Finds a resource source by its key.
     *
     * @param {string} [id] Source key, for example 'quadlet'.
     * @returns {SourceInfo|null} The source, or null when the key is unknown or missing.
     */
    static resourceSource(id) {
        return ResourceSource.RESOURCE_SOURCES.find(source => source.id === id) || null;
    }

    /**
     * Finds the unit name in a card's "systemd" group (row id "unit").
     *
     * @param {(ResourceRowGroup|PropertyGroup)[]} [groups] Row groups of a list item, or the same groups translated
     *   for its card; translation keeps the unit row's string value.
     * @returns {string|null} The unit name, or null when there is none.
     */
    static sourceUnitFromGroups(groups) {
        const group = (groups || []).find(item => item.id === 'systemd');
        const row = group && (group.rows || []).find(item => item.id === 'unit');
        return row?.value ? row.value : null;
    }

    /**
     * Builds the source tooltip text: "Quadlet: tsv-nw1-network.service", the source description
     * (for Manual), or just the source name.
     *
     * @param {SourceInfo|null} info The resource source.
     * @param {string|null} unit Systemd unit name, or null.
     * @returns {string} The tooltip text, empty when there is no source.
     */
    static sourceTooltip(info, unit) {
        if (!info) { return '' }
        if (info.hasUnit && unit) { return `${info.label}: ${unit}` }
        return info.description || info.label;
    }
}
