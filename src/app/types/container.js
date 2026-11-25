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

/**
 * Identifier of a section in the container commands modal.
 *
 * @typedef {'terminal'|'logs'|'processes'|'system-info'} CommandSectionId
 */

/**
 * Identifier of a command entry in the container commands modal.
 *
 * @typedef {'exec-sh'|'exec-bash'|'logs-tail'|'logs-follow'|'logs-since'|'top'|'stats'|'pstree'|'ps-forest'|'ps'|'proc-loop'|'os-release'|'meminfo'|'df'|'id'|'resolv'|'env'} ContainerCommandId
 */

/**
 * One command entry built by commandCatalogue().
 *
 * @typedef {object} ContainerCommandEntry
 * @property {ContainerCommandId} id Stable identifier for React keys and description lookup.
 * @property {boolean} host True when the command runs on the host and does not depend on image tools.
 * @property {string} command Filled command text ready to copy and run.
 */

/**
 * One section of commands built by commandCatalogue().
 *
 * @typedef {object} CommandSection
 * @property {CommandSectionId} id Stable identifier for React keys and heading lookup.
 * @property {ContainerCommandEntry[]} commands Commands in display order, with host commands first.
 */

/**
 * State returned by the useContainerCommands hook.
 *
 * @typedef {object} ContainerCommandsState
 * @property {import('./resource.js').ResourceItem|null} commandsContainer Container whose commands modal is open, or null.
 * @property {(container: import('./resource.js').ResourceItem|null) => void} setCommandsContainer Opens the commands modal for a container, or closes it with null.
 */

/**
 * Page state of the Containers module: the module page state plus the commands modal state.
 *
 * @typedef {import('./module.js').ModulePageState<import('./resource.js').ResourceItem> & ContainerCommandsState} ContainersPageState
 */

export {};
