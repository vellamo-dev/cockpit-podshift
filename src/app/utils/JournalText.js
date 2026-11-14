/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Turns journal entries into `journalctl -o short-iso` text, plain or coloured by priority.
 *
 * @file JournalText.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {createElement} from 'react';

/** @typedef {import('../types/journal.js').JournalEntry} JournalEntry */

/**
 * Formats journal entries as text and as coloured React nodes.
 */
export class JournalText {
    /**
     * Pads a number to two digits.
     *
     * @param {number} value The number.
     * @returns {string} The number with a leading zero when below 10.
     */
    static #pad(value) {
        return String(value).padStart(2, '0');
    }

    /**
     * Formats a time like short-iso does on a UTC host, for example "2026-11-12T09:02:14+00:00".
     *
     * @param {string} iso Time, UTC ISO 8601.
     * @returns {string} The formatted time.
     */
    static time(iso) {
        const d = new Date(iso);
        const pad = JournalText.#pad;
        return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T` +
            `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}+00:00`;
    }

    /**
     * Formats one entry as a short-iso line, for example
     * "2026-11-12T09:02:14+00:00 podshift systemd[1012]: Started x.service.".
     *
     * @param {JournalEntry} entry The entry.
     * @returns {string} The line.
     */
    static line(entry) {
        const source = entry.pid ? `${entry.identifier}[${entry.pid}]` : entry.identifier;
        return `${JournalText.time(entry.time)} ${entry.hostname} ${source}: ${entry.message}`;
    }

    /**
     * Formats entries as text, one line each, oldest first.
     *
     * @param {JournalEntry[]} entries The entries, oldest first.
     * @returns {string} The text with a final newline, or an empty string when there are no entries.
     */
    static toText(entries) {
        return entries.length > 0 ? entries.map(JournalText.line).join('\n') + '\n' : '';
    }

    /**
     * Returns the CSS class of a priority: error for 0 to 3, warning for 4, notice for 5, else none.
     *
     * @param {number} priority syslog priority.
     * @returns {string} The class name, or an empty string.
     */
    static priorityClass(priority) {
        if (priority <= 3) { return 'podshift-log__error' }
        if (priority === 4) { return 'podshift-log__warning' }
        if (priority === 5) { return 'podshift-log__notice' }
        return '';
    }

    /**
     * Formats entries as React nodes: the time is subtle, and the rest of a line is coloured by its priority.
     * The text of the nodes is the same as toText.
     *
     * @param {JournalEntry[]} entries The entries, oldest first.
     * @returns {import('react').ReactNode[]} The nodes.
     */
    static highlight(entries) {
        const nodes = [];
        entries.forEach((entry, index) => {
            const line = JournalText.line(entry);
            const split = line.indexOf(' ');
            const className = JournalText.priorityClass(entry.priority);
            nodes.push(createElement('span', {key: index + 't', className: 'podshift-log__time'}, line.slice(0, split)));
            const rest = line.slice(split) + '\n';
            nodes.push(className ? createElement('span', {key: index + 'm', className}, rest) : rest);
        });
        return nodes;
    }
}
