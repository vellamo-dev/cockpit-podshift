/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Client-side copy of PodShift's rules for custom TSV_* variables and the environment tag.
 * It mirrors check-tsv-config-entry, conf/tsv-rules.conf and is-valid-env-tag in PodShift.
 * PodShift checks again on save and stays the authority; these checks only give early hints.
 *
 * @file TsvConfigRules.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/** @typedef {import('../types/api.js').ConfigProblem} ConfigProblem */

/**
 * Name, value and tag checks. All members are static; this class is not constructed.
 */
export class TsvConfigRules {
    /**
     * Fixed start of every custom variable name.
     *
     * @type {string}
     */
    static PREFIX = 'TSV_';

    /**
     * Whole words between _ that mark a name as a secret (word lines of tsv-rules.conf).
     *
     * @type {string[]}
     */
    static SENSITIVE_WORDS = [
        'PASSWORD', 'PASSWD', 'PSW', 'PSWD', 'PWD', 'PASS',
        'SECRET', 'SECRETS', 'TOKEN', 'APIKEY', 'CREDENTIAL', 'CREDENTIALS'
    ];

    /**
     * Words after which KEY marks a name as a secret (key-after lines of tsv-rules.conf).
     *
     * @type {string[]}
     */
    static KEY_AFTER = ['API', 'PRIVATE'];

    /**
     * Known secret formats in a value (value lines of tsv-rules.conf), with POSIX classes as ASCII ranges.
     *
     * @type {RegExp[]}
     */
    static SENSITIVE_VALUES = [
        /-----BEGIN ([A-Z]+ )*PRIVATE KEY-----/,
        /(^|[^A-Za-z0-9_])gh[pousr]_[A-Za-z0-9]{36}([^A-Za-z0-9_]|$)/,
        /(^|[^A-Za-z0-9_])github_pat_[A-Za-z0-9_]{22,}/,
        /(^|[^A-Za-z0-9_])glpat-[A-Za-z0-9_-]{20,}/,
        /(^|[^A-Za-z0-9_])xox[bp]-[0-9]+-[A-Za-z0-9-]+/,
        /(^|[^A-Za-z0-9])AKIA[A-Z0-9]{16}([^A-Za-z0-9]|$)/,
        /(^|[^A-Za-z0-9_-])eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/
    ];

    /**
     * Turns typed or pasted name text into the part after TSV_: upper case, without spaces
     * at the ends, and without one leading TSV_.
     *
     * @param {string} text Text from the name field.
     * @returns {string} The name without the TSV_ prefix.
     */
    static normaliseName(text) {
        const upper = String(text || '').trim()
                .toUpperCase();
        if (upper.startsWith(TsvConfigRules.PREFIX)) {
            return upper.slice(TsvConfigRules.PREFIX.length);
        }
        return upper;
    }

    /**
     * Checks the form of a full name and the reserved prefixes, like check-tsv-config-name.
     *
     * @param {string} key Full name, for example TSV_APP_DOMAIN.
     * @returns {ConfigProblem|null} INVALID_NAME, RESERVED_NAME, or null when the name is fine.
     */
    static checkName(key) {
        if (!/^TSV_[A-Z][A-Z0-9_]*$/.test(key)) {
            return 'INVALID_NAME';
        }
        if (key.startsWith('TSV_NW') || key.startsWith('TSV_ENV')) {
            return 'RESERVED_NAME';
        }
        return null;
    }

    /**
     * Checks whether a name holds a secret word, like is-tsv-config-name-sensitive.
     * Only whole words between _ count, and KEY only right after API or PRIVATE.
     *
     * @param {string} key Full name, for example TSV_DB_PASSWORD.
     * @returns {boolean} True when the name looks like a secret.
     */
    static isNameSensitive(key) {
        const words = key.slice(TsvConfigRules.PREFIX.length).split('_');
        let previous = '';
        for (const word of words) {
            if (word === '') {
                continue;
            }
            if (TsvConfigRules.SENSITIVE_WORDS.includes(word)) {
                return true;
            }
            if (word === 'KEY' && TsvConfigRules.KEY_AFTER.includes(previous)) {
                return true;
            }
            previous = word;
        }
        return false;
    }

    /**
     * Checks a value like check-tsv-config-value: not empty, and no quotes, control
     * characters or trailing backslash.
     *
     * @param {string} value The value.
     * @returns {ConfigProblem|null} EMPTY_VALUE, INVALID_VALUE, or null when the value is fine.
     */
    static checkValue(value) {
        if (value === '') {
            return 'EMPTY_VALUE';
        }
        // Control characters as PodShift's cockpit-config-arg sees them: codes below 32, and 127.
        // eslint-disable-next-line no-control-regex -- the control characters are what this check looks for
        if (/[\u0000-\u001f\u007f"']/.test(value) || value.endsWith('\\')) {
            return 'INVALID_VALUE';
        }
        return null;
    }

    /**
     * Checks whether a value has a known secret format, like is-tsv-config-value-sensitive.
     *
     * @param {string} value The value.
     * @returns {boolean} True when the value matches a known secret format.
     */
    static isValueSensitive(value) {
        return TsvConfigRules.SENSITIVE_VALUES.some(pattern => pattern.test(value));
    }

    /**
     * Checks a name and value in the same order as check-tsv-config-entry: name, secret name,
     * value, secret value. The first problem is returned.
     *
     * @param {string} key Full name, for example TSV_APP_DOMAIN.
     * @param {string} value The value.
     * @returns {ConfigProblem|null} The first problem, or null when PodShift should accept the entry.
     */
    static checkEntry(key, value) {
        const nameProblem = TsvConfigRules.checkName(key);
        if (nameProblem) {
            return nameProblem;
        }
        if (TsvConfigRules.isNameSensitive(key)) {
            return 'SENSITIVE_NAME';
        }
        const valueProblem = TsvConfigRules.checkValue(value);
        if (valueProblem) {
            return valueProblem;
        }
        if (TsvConfigRules.isValueSensitive(value)) {
            return 'SENSITIVE_VALUE';
        }
        return null;
    }

    /**
     * Checks an environment tag like is-valid-env-tag: 1 to 128 characters of a-z, A-Z, 0-9,
     * _, . and -, not starting with . or -.
     *
     * @param {string} tag The tag.
     * @returns {boolean} True when the tag is valid.
     */
    static isValidEnvTag(tag) {
        return /^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/.test(tag);
    }
}
