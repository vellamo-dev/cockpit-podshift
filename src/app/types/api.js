/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared data shapes for the PodShift API calls and the useAction hook.
 *
 * @file api.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * How the user reaches PodShift: Cockpit admin access or the podshift user.
 *
 * @typedef {'admin'|'podshift'} AccessMode
 */

/**
 * Result of the access check that picks the page to show.
 *
 * @typedef {object} AccessResult
 * @property {'checking'|'not-installed'|'no-access'|'mainboard'} status Page to show.
 * @property {AccessMode} [mode] Access mode, set for 'mainboard' only.
 */

/**
 * Error thrown by a failed handler action.
 *
 * @typedef {Error & { code: string }} ApiError
 */

/**
 * Options of the useAction hook.
 *
 * @typedef {object} ActionOptions
 * @property {number|(() => number)} [poll] Delay in milliseconds between loads, or 0 for a single load;
 *     a function returns the next delay each time, or 0 to stop.
 * @property {boolean} [enabled] False skips the call, for example without admin access.
 */

/**
 * State returned by the useAction hook.
 *
 * @template T
 * @typedef {object} ActionState
 * @property {import('./card.js').PropertyRow[]|null} rows Translated rows, or null when the data has none.
 * @property {T|null} data Last good data, or null before the first load.
 * @property {Error|null} error Error of the last load, or null.
 * @property {boolean} loading True while the first load runs.
 * @property {boolean} refreshing True while any load runs, also with data on screen.
 * @property {() => Promise<void>} refresh Loads the action again.
 */

/**
 * State returned by the useActionResult hook.
 *
 * @template T
 * @typedef {object} ActionResultState
 * @property {T|null} data Data of the last load, or null while none has arrived.
 * @property {Error|null} error Error of the last load, or null.
 * @property {boolean} loading True while a load runs.
 * @property {() => void} reload Loads the action again with the same arguments.
 */

/**
 * Data of an overview-* action: the rows a Properties card shows.
 *
 * @typedef {object} OverviewResult
 * @property {import('./card.js').PropertyRow[]} rows Untranslated label/value rows.
 */

/**
 * One row of the overview-config action. Only rows with editable true can be changed in the UI.
 *
 * @typedef {object} ConfigRow
 * @property {string} id Stable row id, for example tsv_env or tsv_app_domain.
 * @property {string} label Variable name, for example TSV_APP_DOMAIN.
 * @property {string|null} value Value, or null when TSV_ENV is unset.
 * @property {boolean} editable True for custom variables, and for TSV_ENV while it is unset.
 */

/**
 * Data of the overview-config action.
 *
 * @typedef {object} OverviewConfigResult
 * @property {ConfigRow[]} rows Untranslated rows: TSV_ENV, set TSV_NW* values, then custom variables.
 * @property {string[]} envSuggestions Suggested environment tags from PodShift's main.conf.
 */

/**
 * A reason PodShift refuses a config-set, config-unset or env-set request.
 *
 * @typedef {'INVALID_NAME'|'RESERVED_NAME'|'SENSITIVE_NAME'|'EMPTY_VALUE'|'INVALID_VALUE'|'SENSITIVE_VALUE'|'RULES_UNAVAILABLE'|'NOT_SET'|'INVALID_TAG'|'ALREADY_SET'} ConfigProblem
 */

/**
 * Data of the config-set, config-unset and env-set actions. A refused request is ok false, not an error.
 *
 * @typedef {object} ConfigResult
 * @property {string} key The variable name.
 * @property {boolean} ok True when the change was saved.
 * @property {ConfigProblem} [error] Why it was refused, when ok is false.
 * @property {string} [message] PodShift's message for the refusal, when ok is false.
 */

/**
 * Data of the ping action.
 *
 * @typedef {object} PingResult
 * @property {boolean} pong True when the handler ran in the podshift session.
 * @property {number} uid UID of the podshift user, always 300.
 */

/**
 * One action in the capabilities list.
 *
 * @typedef {object} CapabilityAction
 * @property {string} action Action name.
 * @property {string} name Display name.
 * @property {string} description Short description.
 * @property {'active'|'deprecated'|'retired'} status Lifecycle state.
 * @property {object} input JSON Schema of the input.
 * @property {object} output JSON Schema of the output.
 */

/**
 * Data of the capabilities action.
 *
 * @typedef {object} CapabilitiesResult
 * @property {CapabilityAction[]} actions Every recognised action and its contract.
 */

/**
 * Data returned by each handler action, keyed by action name. useAction, useActionResult
 * and callAction use this so the data type follows from the action name.
 *
 * @typedef {{
 *   'ping': PingResult,
 *   'capabilities': CapabilitiesResult,
 *   'overview-info': OverviewResult,
 *   'overview-config': OverviewConfigResult,
 *   'overview-status': OverviewResult,
 *   'overview-usage': OverviewResult,
 *   'health-check': import('./health.js').HealthResult,
 *   'containers-list': import('./resource.js').ResourceList,
 *   'images-list': import('./resource.js').ResourceList,
 *   'volumes-list': import('./resource.js').ResourceList,
 *   'networks-list': import('./resource.js').ResourceList,
 *   'secrets-list': import('./secret.js').SecretList,
 *   'services-list': import('./service.js').ServiceList,
 *   'quadlets-list': import('./quadlet.js').QuadletList,
 *   'inspect': import('./inspect.js').InspectResult,
 *   'service-view': import('./service.js').ServiceViewResult,
 *   'service-logs': import('./service.js').ServiceLogResult,
 *   'quadlet-view': import('./service.js').QuadletViewResult,
 *   'config-set': ConfigResult,
 *   'config-unset': ConfigResult,
 *   'env-set': ConfigResult,
 *   'quadlet-drop': import('./drop.js').DropResult,
 *   'quadlet-drop-history': import('./drop.js').DropHistoryResult,
 *   'quadlet-install-log': import('./drop.js').InstallLogResult,
 *   'quadlet-remove': import('./drop.js').RemoveResult,
 * }} ActionDataMap
 */

export {};
