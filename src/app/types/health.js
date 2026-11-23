/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared data shapes for the result of the health-check handler action.
 *
 * @file health.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * State of one check or of the whole health check.
 *
 * @typedef {'ok'|'note'|'warn'|'fail'} HealthState
 */

/**
 * One check in a health group.
 *
 * @typedef {object} HealthRow
 * @property {string} id Stable key of the check.
 * @property {string} label Name of the check.
 * @property {string} value Result text of the check.
 * @property {HealthState} state State of the check.
 * @property {string} [fix] Hint that fixes a warning or failure.
 */

/**
 * A titled group of checks.
 *
 * @typedef {object} HealthGroup
 * @property {string} id Stable key of the group.
 * @property {string} label Group heading.
 * @property {HealthRow[]} [rows] Checks of the group.
 */

/**
 * Overall result shown in the card title.
 *
 * @typedef {object} HealthSummary
 * @property {HealthState} state Worst state of all checks.
 * @property {string} label Summary text.
 * @property {number} passed Number of checks in the ok state.
 * @property {number} notes Number of checks in the note state.
 * @property {number} warnings Number of checks in the warn state.
 * @property {number} failed Number of checks in the fail state.
 */

/**
 * Data returned by the health-check action.
 *
 * @typedef {object} HealthResult
 * @property {HealthSummary} summary Overall result.
 * @property {HealthGroup[]} groups Checks, grouped.
 */

/**
 * Value of the shared health-check context.
 *
 * @typedef {object} HealthCheckState
 * @property {HealthResult|null} data Last good result, or null before the first load.
 * @property {Error|null} error Error of the last load, or null.
 * @property {boolean} loading True while the first load runs.
 * @property {boolean} refreshing True while a check runs, also with a result on screen.
 * @property {(fresh?: boolean) => void} [ensure] Starts a load once per refresh token; with fresh, again for the same token when no check runs.
 */

export {};
