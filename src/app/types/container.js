/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared data shapes for containers: environment variables.
 *
 * @file container.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * One environment variable of a container, from Config.Env of podman container inspect.
 *
 * @typedef {object} EnvVariable
 * @property {string} name Variable name, for example 'TZ'.
 * @property {string} value Variable value; may be empty.
 */

export {};
