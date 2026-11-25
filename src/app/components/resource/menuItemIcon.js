/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * PatternFly icons for kebab menu items, keyed by the item's stable key so every
 * CardActionsMenu shows the same icon for the same action.
 *
 * @file menuItemIcon.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {ClipboardCheckIcon} from '@patternfly/react-icons/dist/esm/icons/clipboard-check-icon';
import {CodeIcon} from '@patternfly/react-icons/dist/esm/icons/code-icon';
import {CopyIcon} from '@patternfly/react-icons/dist/esm/icons/copy-icon';
import {DownloadIcon} from '@patternfly/react-icons/dist/esm/icons/download-icon';
import {ExternalLinkAltIcon} from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import {FileAltIcon} from '@patternfly/react-icons/dist/esm/icons/file-alt-icon';
import {FileCodeIcon} from '@patternfly/react-icons/dist/esm/icons/file-code-icon';
import {InfoCircleIcon} from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import {OutlinedListAltIcon} from '@patternfly/react-icons/dist/esm/icons/outlined-list-alt-icon';
import {PencilAltIcon} from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';
import {PlayIcon} from '@patternfly/react-icons/dist/esm/icons/play-icon';
import {PlusIcon} from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import {RedoIcon} from '@patternfly/react-icons/dist/esm/icons/redo-icon';
import {SearchIcon} from '@patternfly/react-icons/dist/esm/icons/search-icon';
import {SortAmountDownIcon} from '@patternfly/react-icons/dist/esm/icons/sort-amount-down-icon';
import {SortAmountUpIcon} from '@patternfly/react-icons/dist/esm/icons/sort-amount-up-icon';
import {StopIcon} from '@patternfly/react-icons/dist/esm/icons/stop-icon';
import {TerminalIcon} from '@patternfly/react-icons/dist/esm/icons/terminal-icon';
import {TrashIcon} from '@patternfly/react-icons/dist/esm/icons/trash-icon';

/** @typedef {import('../../types/resource.js').PatternFlyIcon} PatternFlyIcon */

/**
 * Returns the PatternFly icon component for a kebab menu item key, or null when
 * the key has no icon.
 *
 * @param {string} key The item's stable key, for example inspect or commands.
 * @returns {PatternFlyIcon|null} The icon component.
 */
export function menuItemIcon(key) {
    switch (key) {
    case 'copy':
        return CopyIcon;
    case 'inspect':
        return SearchIcon;
    case 'variables':
        return CodeIcon;
    case 'commands':
        return TerminalIcon;
    case 'quadlet':
        return FileCodeIcon;
    case 'unit':
        return FileAltIcon;
    case 'uninstall':
    case 'remove':
    case 'delete':
        return TrashIcon;
    case 'status':
        return InfoCircleIcon;
    case 'log':
        return OutlinedListAltIcon;
    case 'open-log':
        return ExternalLinkAltIcon;
    case 'add-variable':
        return PlusIcon;
    case 'report':
        return ClipboardCheckIcon;
    case 'newest':
        return SortAmountDownIcon;
    case 'oldest':
        return SortAmountUpIcon;
    case 'download':
        return DownloadIcon;
    case 'edit':
        return PencilAltIcon;
    case 'start':
        return PlayIcon;
    case 'stop':
        return StopIcon;
    case 'restart':
        return RedoIcon;
    default:
        return null;
    }
}

/**
 * Returns whether a kebab menu item should use the danger tone.
 *
 * @param {string} key The item's stable key.
 * @returns {boolean} True for Uninstall, Remove and Delete.
 */
export function menuItemIsDanger(key) {
    return key === 'uninstall' || key === 'remove' || key === 'delete';
}
