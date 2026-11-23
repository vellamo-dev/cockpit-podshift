/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Types of the drop-quadlet tab and its actions quadlet-drop, quadlet-drop-history,
 * quadlet-install-log and quadlet-remove.
 *
 * @file drop.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * Status of one dropped file in PodShift's drop history.
 *
 * @typedef {'accepted'|'validated'|'installing'|'installed'|'unchanged'|'failed'|'refused'} DropStatus
 */

/**
 * Icon kind of a status: still being worked on, installed, unchanged (already installed with
 * the same content), failed in validation or install, or refused (for example a wrong file
 * type or an installed name).
 *
 * @typedef {'progress'|'installed'|'unchanged'|'failed'|'refused'} DropStatusKind
 */

/**
 * One item of the drop history: the newest record of one drop. PodShift 0.25.0 gives every
 * dropped file its own drop ID, so the same name dropped twice shows as two items.
 *
 * @typedef {object} DropHistoryItem
 * @property {string} id Drop ID, a UUIDv7, for example 019a7a3e-5c2b-7d4e-9f01-23456789abcd.
 * @property {string} name File name as dropped, for example web.container or shop.zip.
 * @property {DropStatus} status Latest status.
 * @property {string} time Time of the latest status, UTC ISO 8601.
 * @property {string} [reason] Why it failed or was refused.
 * @property {string} [description] Description= from the [Unit] section.
 */

/**
 * Data of the quadlet-drop-history action.
 *
 * @typedef {object} DropHistoryResult
 * @property {boolean} readable False when the journal cannot be read.
 * @property {'JOURNAL_UNREADABLE'} [error] Set when readable is false.
 * @property {string} [reason] First line of the journalctl error.
 * @property {DropHistoryItem[]} items Items, newest first.
 */

/**
 * Data of the quadlet-install-log action.
 *
 * @typedef {object} InstallLogResult
 * @property {boolean} readable False when the journal cannot be read.
 * @property {'JOURNAL_UNREADABLE'} [error] Set when readable is false.
 * @property {string} [reason] First line of the journalctl error.
 * @property {import('./journal.js').JournalEntry[]} entries Entries, oldest first.
 */

/**
 * Refusal code of the quadlet-drop action.
 *
 * @typedef {'INVALID_NAME'|'UNSUPPORTED_TYPE'|'INVALID_CONTENT'|'EMPTY_FILE'|'TOO_LARGE'|'WRONG_OWNER'|'NAME_BUSY'|'DROP_UNAVAILABLE'} DropError
 */

/**
 * Data of the quadlet-drop action.
 *
 * @typedef {object} DropResult
 * @property {string} name File name in the drop directory.
 * @property {boolean} ok True when the file was written.
 * @property {DropError} [error] Why it was refused, when ok is false.
 * @property {string} [message] PodShift's message for the refusal.
 */

/**
 * Refusal code of the quadlet-remove action.
 *
 * @typedef {'INVALID_NAME'|'NOT_FOUND'|'IN_USE'|'BUSY'|'REMOVE_UNAVAILABLE'} RemoveError
 */

/**
 * Data of the quadlet-remove action. ok true means the removal is queued; the install log follows it.
 *
 * @typedef {object} RemoveResult
 * @property {string} name The name that was sent.
 * @property {boolean} ok True when the removal was queued.
 * @property {RemoveError} [error] Why it was refused, when ok is false.
 * @property {string} [message] PodShift's message for the refusal, for example used by web.container.
 */

/**
 * What an Uninstall item removes. name goes to quadlet-remove: the app name for a file in an app
 * (the whole app is uninstalled), else the Quadlet file name.
 *
 * @typedef {object} UninstallTarget
 * @property {string} name Name sent to quadlet-remove, for example boy.container or shop.
 * @property {boolean} isApp True when the whole app is uninstalled.
 * @property {string} file The Quadlet file the item comes from; the same as name for a single file.
 */

/**
 * Result of a file name check: null when the name is accepted, else the reason.
 *
 * @typedef {null|'NO_NAME'|'BAD_PATH'|'HIDDEN'|'BAD_EXTENSION'|'BAD_NAME'} DropNameProblem
 */

/**
 * Result of a file size check: null when the size is accepted, else the reason.
 *
 * @typedef {null|'EMPTY'|'TOO_LARGE'} DropSizeProblem
 */

/**
 * A card of the drop-quadlet page that polls on its own schedule.
 *
 * @typedef {'history'|'log'} DropPollCard
 */

/**
 * One step of a poll schedule of the drop-quadlet page: the delays of each card until a time
 * since the schedule started.
 *
 * @typedef {object} DropPollStep
 * @property {number} untilMs The step lasts until this many ms after the start; Infinity for no end.
 * @property {number} historyMs Poll delay of the drop history, in ms.
 * @property {number} logMs Poll delay of the install log, in ms.
 */

export {};
