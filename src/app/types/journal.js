/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared data shapes for journal log entries, as shown in a log view.
 *
 * @file journal.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * syslog priority of a journal entry: 0 emerg, 1 alert, 2 crit, 3 err, 4 warning, 5 notice, 6 info, 7 debug.
 *
 * @typedef {0|1|2|3|4|5|6|7} JournalPriority
 */

/**
 * One journal entry, with the fields `journalctl -o short-iso` shows.
 *
 * @typedef {object} JournalEntry
 * @property {string} time Time of the entry, UTC ISO 8601.
 * @property {string} hostname Host name.
 * @property {string} identifier SYSLOG_IDENTIFIER, for example systemd or the unit name without .service.
 * @property {number} [pid] Process ID, shown in brackets after the identifier.
 * @property {JournalPriority} priority syslog priority.
 * @property {string} message The message.
 */

export {};
