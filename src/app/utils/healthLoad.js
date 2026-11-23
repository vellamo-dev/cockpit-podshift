/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Decides whether the shared health check should start a new load.
 *
 * @file healthLoad.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * Tells whether the shared health check should start a new load.
 * Without fresh, it loads once per refresh token.
 * With fresh, it loads again for the same token, unless a check is already running for it,
 * because that running check gives a fresh result anyway.
 *
 * @param {boolean} fresh True when the caller wants a new result, for example the Health tab on opening.
 * @param {number|null} attemptedToken Refresh token of the last started load, or null before the first one.
 * @param {number} token Current refresh token.
 * @param {number} running Number of health checks still running.
 * @returns {boolean} True when a new load should start.
 */
export function healthLoadNeeded(fresh, attemptedToken, token, running) {
    if (attemptedToken !== token) { return true }
    return fresh && running === 0;
}
