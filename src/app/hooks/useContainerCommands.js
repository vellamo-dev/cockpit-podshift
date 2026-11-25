/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Hook that keeps the open container commands modal of the Containers page.
 *
 * @file useContainerCommands.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {useState} from 'react';

/** @typedef {import('../types/resource.js').ResourceItem} ResourceItem */
/** @typedef {import('../types/container.js').ContainerCommandsState} ContainerCommandsState */

/**
 * Keeps the container whose commands modal is open, or null when closed.
 * ContainersPage merges the result into its module page state.
 *
 * @returns {ContainerCommandsState} The open container and its setter.
 */
export function useContainerCommands() {
    const [commandsContainer, setCommandsContainer] = useState(/** @type {ResourceItem|null} */ (null));
    return {commandsContainer, setCommandsContainer};
}
