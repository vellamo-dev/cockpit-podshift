/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Pure helpers that decide which tabs and features the installed PodShift supports,
 * from the result of the capabilities action.
 *
 * @file capabilities.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/** @typedef {import('../types/capabilities.js').CapabilitiesState} CapabilitiesState */

/**
 * Builds the set of usable action names: every listed action whose status is not retired.
 * Deprecated actions still run, so they count. Anything that is not a list of actions gives an empty set.
 *
 * @param {unknown} data Data of the capabilities action, {actions: [...]}.
 * @returns {Set<string>} The usable action names.
 */
export function buildAvailableSet(data) {
    const actions = /** @type {{actions?: unknown}|null} */ (data)?.actions;
    const available = new Set();
    if (!Array.isArray(actions)) { return available }
    for (const entry of actions) {
        if (entry && typeof entry.action === 'string' && entry.action !== '' && entry.status !== 'retired') {
            available.add(entry.action);
        }
    }
    return available;
}

/**
 * Checks that every action of a list is available. An empty list is always available, and
 * so is any list while the set is unknown (null), so nothing is hidden before the list is read.
 *
 * @param {Set<string>|null} available Usable action names, or null when unknown.
 * @param {string[]} [actions] Required action names.
 * @returns {boolean} True when the actions can be used.
 */
export function isAvailable(available, actions = []) {
    if (available == null) { return true }
    return actions.every(action => available.has(action));
}

/**
 * Checks one action against the capabilities state. Only a read list can hide an action.
 *
 * @param {CapabilitiesState} caps Capabilities state.
 * @param {string} action Action name.
 * @returns {boolean} True when the action can be used, or when the list is not read.
 */
export function hasCapability(caps, action) {
    return caps.status !== 'ready' || isAvailable(caps.available, [action]);
}

/**
 * Picks the tabs to show. While the list loads for the first time no tab is shown, so a tab
 * that turns out to be missing never appears or mounts; when it could not be read, every tab is
 * shown; once read, only tabs whose required actions are all available.
 *
 * @template {{requires?: string[]}} M
 * @param {M[]} modules Tabs in display order.
 * @param {CapabilitiesState} caps Capabilities state.
 * @returns {M[]} The tabs to show, in the same order.
 */
export function visibleModules(modules, caps) {
    if (caps.status === 'loading') { return [] }
    if (caps.status !== 'ready') { return modules }
    return modules.filter(module => isAvailable(caps.available, module.requires || []));
}
