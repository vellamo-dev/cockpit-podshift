/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Types of the capabilities state: which handler actions the installed PodShift offers.
 *
 * @file capabilities.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * State of the capabilities list. While it loads for the first time no tab is shown. When it
 * could not be read, every tab is shown. Until it is read, every optional action counts as available.
 *
 * @typedef {object} CapabilitiesState
 * @property {'loading'|'ready'|'error'} status Loading, read, or failed with no list yet.
 * @property {Set<string>|null} available Names of the actions that are not retired; null unless ready.
 * @property {Error|null} error Error of the failed load; null unless status is error.
 */

export {};
