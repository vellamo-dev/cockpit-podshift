/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared data shapes for secrets, as returned by the secrets-list action and shown on the Secrets tab.
 * Secret values are never part of them.
 *
 * @file secret.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * One container that references a secret: as a file at a path, or as an environment variable.
 *
 * @typedef {object} SecretUse
 * @property {string} container Container name, or its short ID when it has no name.
 * @property {string} containerId Full container ID.
 * @property {string} state Podman state in lower case, for example running or exited.
 * @property {'file'|'env'} type How the container gets the secret.
 * @property {string} target File path in the container for file, or the variable name for env.
 */

/**
 * One secret from the secrets-list action, in the resource card shape.
 * Secrets have no source: they are not created by Quadlet or systemd.
 *
 * @typedef {object} SecretItem
 * @property {string} id Full secret ID; also the React key and the Inspect ref.
 * @property {string} title Secret name, or the short ID when there is no name.
 * @property {string} subtitle 12-character short ID.
 * @property {string} name Secret name.
 * @property {string} driver Driver name, for example file, pass or shell.
 * @property {string} created Creation time, UTC ISO 8601, or empty.
 * @property {string} updated Last update time, UTC ISO 8601, or empty.
 * @property {'In use'|'Unused'} status Status text, untranslated.
 * @property {boolean} inUse True when any container, running or stopped, uses the secret.
 * @property {boolean} running True when a container that uses the secret is running.
 * @property {SecretUse[]} usedBy Containers that use the secret.
 * @property {import('./resource.js').ResourceRow[]} rows Main rows, untranslated: driver, created, updated, used-by.
 */

/**
 * List of secrets as returned by the secrets-list action. Secret values are never included.
 *
 * @typedef {object} SecretList
 * @property {SecretItem[]} items The secrets.
 */

export {};
