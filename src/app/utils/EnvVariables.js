/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Helpers for container environment variables: podman's default variables, secret detection and masking,
 * and the NAME=value text of the Variables view.
 *
 * @file EnvVariables.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/** @typedef {import('../types/container.js').EnvVariable} EnvVariable */

/**
 * Helpers for container environment variables: defaults, secret masking, and NAME=value text.
 * All members are static; this class is not constructed.
 */
export class EnvVariables {
    /**
     * Text shown instead of a secret value.
     *
     * @type {string}
     */
    static #SECRET_MASK = '••••••';

    /**
     * Variables that podman or the image set in almost every container; listed last.
     *
     * @type {Set<string>}
     */
    static #DEFAULT_VARIABLES = new Set(['PATH', 'container', 'HOME', 'HOSTNAME', 'TERM']);

    /**
     * Name parts that mark a value as secret. A name is split on "_", "-" and "." and upper-cased,
     * so DB_PSWD matches but PASSENGER_COUNT, KEYBOARD and MONKEY do not.
     *
     * @type {Set<string>}
     */
    static #SECRET_NAME_PARTS = new Set([
        'PASSWORD', 'PASSWD', 'PASS', 'PWD', 'PSW', 'PSWD', 'PW',
        'SECRET', 'TOKEN', 'KEY', 'APIKEY', 'PRIVATE',
        'CREDENTIAL', 'CREDENTIALS', 'CRED', 'AUTH',
        'SALT', 'SIGNATURE', 'CERT', 'DSN',
    ]);

    /**
     * The password in a URL such as scheme://user:pass@host: group 1 is up to the colon, group 2 the password.
     *
     * @type {RegExp}
     */
    static #URL_PASSWORD = /([a-z][a-z0-9+.-]*:\/\/[^\s:/@]*:)([^\s/@]+)(?=@)/gi;

    /**
     * Tells whether a variable is one of podman's default variables.
     *
     * @param {string} name Variable name.
     * @returns {boolean} True for PATH, container, HOME, HOSTNAME and TERM.
     */
    static #isDefaultVariable(name) {
        return EnvVariables.#DEFAULT_VARIABLES.has(name);
    }

    /**
     * Tells whether a variable holds a secret, by the parts of its name.
     * PWD alone with a value starting with "/" is the working directory, not a password.
     *
     * @param {string} name Variable name.
     * @param {string} value Variable value.
     * @returns {boolean} True when a name part is in the secret list.
     */
    static #isSecretVariable(name, value) {
        const hits = name.toUpperCase().split(/[_.-]+/)
                .filter(part => EnvVariables.#SECRET_NAME_PARTS.has(part));
        if (hits.length === 0) { return false }
        return !(hits.every(part => part === 'PWD') && value.startsWith('/'));
    }

    /**
     * Masks only the password part of URLs in a value, for example postgres://app:s3cret@db/app.
     *
     * @param {string} value Variable value.
     * @returns {string} The value with each URL password replaced by the mask.
     */
    static #maskUrlPasswords(value) {
        return value.replace(EnvVariables.#URL_PASSWORD, '$1' + EnvVariables.#SECRET_MASK);
    }

    /**
     * Returns the value to show for a variable.
     *
     * @param {EnvVariable} variable The variable.
     * @param {boolean} showSecrets When true, values are shown as they are.
     * @returns {string} The value, fully masked for a secret name, or with URL passwords masked.
     */
    static #displayValue(variable, showSecrets) {
        if (showSecrets) { return variable.value }
        if (EnvVariables.#isSecretVariable(variable.name, variable.value)) { return EnvVariables.#SECRET_MASK }
        return EnvVariables.#maskUrlPasswords(variable.value);
    }

    /**
     * Compares two variables by name, ignoring case.
     *
     * @param {EnvVariable} a First variable.
     * @param {EnvVariable} b Second variable.
     * @returns {number} Negative, zero or positive, for sorting A to Z.
     */
    static #compareNames(a, b) {
        const left = a.name.toLowerCase();
        const right = b.name.toLowerCase();
        if (left === right) { return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0) }
        return left < right ? -1 : 1;
    }

    /**
     * Formats one variable as a NAME=value line.
     *
     * @param {EnvVariable} variable The variable.
     * @param {boolean} showSecrets When true, secret values are shown as they are.
     * @returns {string} The line.
     */
    static #formatLine(variable, showSecrets) {
        return `${variable.name}=${EnvVariables.#displayValue(variable, showSecrets)}`;
    }

    /**
     * Builds the NAME=value text of the Variables view: the container's own variables A to Z,
     * then podman's defaults A to Z under a "# podman defaults" comment.
     *
     * @param {EnvVariable[]} variables The variables.
     * @param {boolean} showSecrets When true, secret values are shown as they are.
     * @returns {string} The text, one variable per line.
     */
    static envToText(variables, showSecrets) {
        const own = variables.filter(variable => !EnvVariables.#isDefaultVariable(variable.name)).sort(EnvVariables.#compareNames);
        const defaults = variables.filter(variable => EnvVariables.#isDefaultVariable(variable.name)).sort(EnvVariables.#compareNames);
        const lines = own.map(variable => EnvVariables.#formatLine(variable, showSecrets));
        if (defaults.length > 0) {
            if (lines.length > 0) { lines.push('') }
            lines.push('# podman defaults', ...defaults.map(variable => EnvVariables.#formatLine(variable, showSecrets)));
        }
        return lines.join('\n');
    }

    /**
     * Reads variables from podman's Config.Env form. The name ends at the first "=", so a value
     * may hold "=" too. An entry without "=" has an empty value.
     *
     * @param {unknown} list Config.Env of podman inspect: "NAME=value" strings.
     * @returns {EnvVariable[]} The variables, in the given order; empty when list is not an array.
     */
    static envFromList(list) {
        if (!Array.isArray(list)) { return [] }
        return list
                .filter(entry => typeof entry === 'string' && entry !== '')
                .map(entry => {
                    const at = entry.indexOf('=');
                    return at < 0
                        ? {name: entry, value: ''}
                        : {name: entry.slice(0, at), value: entry.slice(at + 1)};
                });
    }
}
