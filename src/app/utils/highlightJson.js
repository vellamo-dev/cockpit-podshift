/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Small JSON syntax highlighter: wraps keys, strings, numbers, booleans and null in spans,
 * and puts braces, brackets, colons and commas in a lighter punctuation span.
 * The colours come from CodeViewModal.scss.
 *
 * @file highlightJson.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {createElement} from 'react';

/**
 * Returns the token kind of match from the JSON pattern.
 *
 * @param {string[]} match The match: group 1 is a string, group 2 the colon after a key.
 * @returns {'key'|'string'|'number'|'boolean'|'null'} The kind, used in the class name.
 */
function tokenKind(match) {
    if (match[1]) {
        return match[2] ? 'key' : 'string';
    }
    if (match[0] === 'true' || match[0] === 'false') {
        return 'boolean';
    }
    if (match[0] === 'null') {
        return 'null';
    }
    return 'number';
}

/**
 * Wraps text between tokens (braces, brackets, colons, commas and whitespace) in a punctuation span.
 *
 * @param {string} text The text between two tokens.
 * @param {number} key A unique React key.
 * @returns {import('react').ReactElement} The punctuation span.
 */
function punctuation(text, key) {
    return createElement('span', {key: 'p' + key, className: 'podshift-code__symb'}, text);
}

/**
 * Splits formatted JSON text into coloured spans.
 * Uses React elements only, so no HTML is ever injected.
 *
 * @param {string} text JSON text, for example from JSON.stringify(data, null, 4).
 * @returns {Array<import('react').ReactElement>} Children for a code element.
 */
export function highlightJson(text) {
    // A string (with an optional colon after it, which makes it a key), true, false, null or a number.
    const pattern = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
    const nodes = [];
    let last = 0;
    let match = pattern.exec(text);
    while (match !== null) {
        if (match.index > last) {
            nodes.push(punctuation(text.slice(last, match.index), last));
        }
        const kind = tokenKind(match);
        nodes.push(createElement('span', {key: match.index, className: 'podshift-code__' + kind}, match[1] || match[0]));
        if (match[2]) {
            nodes.push(punctuation(match[2], match.index + match[1].length));
        }
        last = pattern.lastIndex;
        match = pattern.exec(text);
    }
    if (last < text.length) {
        nodes.push(punctuation(text.slice(last), last));
    }
    return nodes;
}
