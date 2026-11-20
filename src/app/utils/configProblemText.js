/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Translated hint for a problem that the client-side config checks found.
 *
 * @file configProblemText.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {i18n} from './i18n.js';

/** @typedef {import('../types/api.js').ConfigProblem} ConfigProblem */

/**
 * Returns the hint shown under a field for a problem code. The texts follow PodShift's own messages.
 *
 * @param {ConfigProblem|null} problem The problem code, or null.
 * @returns {string|null} The translated hint, or null when there is no problem.
 */
export function configProblemText(problem) {
    switch (problem) {
    case 'INVALID_NAME':
        return i18n("Use a capital letter, then capital letters, digits or _.");
    case 'RESERVED_NAME':
        return i18n("Names starting with TSV_NW or TSV_ENV are managed by PodShift.");
    case 'SENSITIVE_NAME':
    case 'SENSITIVE_VALUE':
        return i18n("Secrets don't belong in config. Use a Podman secret instead.");
    case 'EMPTY_VALUE':
        return i18n("Value must not be empty.");
    case 'INVALID_VALUE':
        return i18n("Value must not contain quotes (\" or '), control characters or a trailing backslash.");
    case 'INVALID_TAG':
        return i18n("Use 1 to 128 characters of a-z, A-Z, 0-9, _, . and -, not starting with . or -.");
    default:
        return null;
    }
}
