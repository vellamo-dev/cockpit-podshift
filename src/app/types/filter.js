/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared data shapes for the toolbar filters of the card grid modules (BaseFilter and its subclasses).
 *
 * @file filter.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * One option of a filter toggle group, for example All, Quadlet or In use.
 * A SourceFilterOption is one too.
 *
 * @typedef {object} FilterOption
 * @property {string} id Option key, for example all, quadlet or in-use.
 * @property {string} label Translated name.
 * @property {import('./resource.js').PatternFlyIcon} [Icon] PatternFly icon, omitted for All and for options without one.
 */

/**
 * Settings a filter is built from. BaseFilter copies each field onto the instance.
 *
 * @typedef {object} FilterSettings
 * @property {string} idPrefix Prefix of each toggle button id, for example 'podshift-container-source-'.
 * @property {string} label Translated aria label of the toggle group, for example "Source" or "Usage".
 * @property {string} [defaultValue] Option id selected when the page opens; 'all' when left out.
 */

/**
 * Settings of a SourceFilter. The aria label is always "Source".
 *
 * @typedef {object} SourceFilterSettings
 * @property {string} idPrefix Prefix of each toggle button id, for example 'podshift-container-source-'.
 * @property {import('./resource.js').ResourceSourceId[]} sources Source keys shown after All, in RESOURCE_SOURCES order.
 */

/**
 * Settings of a UsageFilter. The aria label is always "Usage".
 *
 * @typedef {object} UsageFilterSettings
 * @property {string} idPrefix Prefix of each toggle button id, for example 'podshift-secret-usage-'.
 */

/**
 * Settings of a StateFilter. The aria label is always "State".
 *
 * @typedef {object} StateFilterSettings
 * @property {string} idPrefix Prefix of each toggle button id, for example 'podshift-service-state-'.
 */

/**
 * Settings of a QuadletStatusFilter. The aria label is always "State".
 *
 * @typedef {object} QuadletStatusFilterSettings
 * @property {string} idPrefix Prefix of each toggle button id, for example 'podshift-quadlet-state-'.
 */

/**
 * Settings of a QuadletTypeFilter. The aria label is always "Type".
 *
 * @typedef {object} QuadletTypeFilterSettings
 * @property {string} idPrefix Prefix of each toggle button id, for example 'podshift-quadlet-type-'.
 */

export {};
