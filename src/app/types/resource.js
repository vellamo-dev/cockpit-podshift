/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared data shapes for resource cards, such as networks and images, and their sources.
 *
 * @file resource.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * Source key of a resource.
 *
 * @typedef {'quadlet'|'container'|'unit'|'unmanaged'|'builtin'} ResourceSourceId
 */

/**
 * A PatternFly icon component, as @patternfly/react-icons exports it: a class
 * component whose props are SVGIconProps.
 *
 * @typedef {import('react').ComponentClass<import('@patternfly/react-icons/dist/esm/createIcon').SVGIconProps>} PatternFlyIcon
 */

/**
 * Where a resource comes from, with its label colour and icon.
 *
 * @typedef {object} ResourceSource
 * @property {ResourceSourceId} id Source key.
 * @property {string} label Translated name.
 * @property {string} [description] Translated tooltip text, shown instead of the name, for example for Manual.
 * @property {string} color PatternFly Label colour.
 * @property {PatternFlyIcon} Icon PatternFly icon component.
 * @property {boolean} hasUnit True when the tooltip also names the systemd unit.
 */

/**
 * One option of a source filter toggle group: All, or a resource source.
 *
 * @typedef {object} SourceFilterOption
 * @property {string} id Option key, for example all or quadlet.
 * @property {string} label Translated name.
 * @property {PatternFlyIcon} [Icon] PatternFly icon, omitted for All.
 */

/**
 * One label/value row of a list item, as the list actions return it (containers-list, images-list,
 * volumes-list, networks-list, secrets-list). The handler leaves out empty values and turns every
 * value into a string with jq tostring, so value is always a non-empty string; the output contracts
 * say the same. Rows ready for display are PropertyRow.
 *
 * @typedef {object} ResourceRow
 * @property {string} id Stable row id, for example image or unit_state.
 * @property {string} label Untranslated label.
 * @property {string} value The value, never empty.
 */

/**
 * A titled group of rows of a list item, as the list actions return it, for example systemd.
 *
 * @typedef {object} ResourceRowGroup
 * @property {string} id Stable group id, for example systemd.
 * @property {string} label Untranslated heading.
 * @property {ResourceRow[]} rows Rows of the group.
 */

/**
 * One resource item as returned by a list action, for example networks-list or images-list.
 *
 * @typedef {object} ResourceItem
 * @property {string} id Real name of the resource; also the React key.
 * @property {string} [fullId] Images only: the full image ID without sha256:, passed to inspect; id is the 12-character short ID.
 * @property {string} title Display name.
 * @property {string} [subtitle] Real name shown under the title.
 * @property {ResourceSourceId} [source] Source key, see ResourceSource.
 * @property {string} [status] Status text, untranslated.
 * @property {boolean} [running] True when at least one container that uses the resource is running.
 * @property {'registry'|'local'} [autoUpdate] Containers only: the io.containers.autoupdate policy, missing when off.
 * @property {boolean} [autoUpdateActive] Containers only: false when the policy is set but has no effect, because systemd does not run the container.
 * @property {'success'|'warning'|'danger'|'info'|'custom'} [statusVariant] PatternFly Label status for the status text.
 * @property {ResourceRow[]} [rows] Main rows, untranslated.
 * @property {ResourceRowGroup[]} [groups] Row groups below the main rows, untranslated.
 */

/**
 * List of resource items as returned by containers-list, images-list, volumes-list or networks-list.
 *
 * @typedef {object} ResourceList
 * @property {ResourceItem[]} items The resources.
 */

/**
 * Input of resourceToText: what a resource card shows, as plain values.
 *
 * @typedef {object} ResourceText
 * @property {string} title Card title.
 * @property {string} [description] Optional description shown under the title.
 * @property {string} [subtitle] Card subtitle.
 * @property {string} [status] Status text.
 * @property {string|null} [source] Source label.
 * @property {import('./card.js').PropertyRow[]} [rows] Main rows.
 * @property {import('./card.js').PropertyGroup[]} [groups] Row groups.
 */

export {};
