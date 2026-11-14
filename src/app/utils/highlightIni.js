/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Small INI / env file highlighter: wraps names, "=", values and comment lines in spans.
 * The colours come from CodeViewModal.scss and are shared with highlightJson.
 *
 * @file highlightIni.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {createElement} from 'react';

/**
 * Splits NAME=value text into plain text and coloured spans, line by line.
 * Lines starting with # or ; are comments. Uses React elements only, so no HTML is ever injected.
 *
 * @param {string} text The text, one entry per line.
 * @returns {Array<string|import('react').ReactElement>} Children for a code element.
 */
export function highlightIni(text) {
    const nodes = [];
    text.split('\n').forEach((line, index) => {
        if (index > 0) { nodes.push('\n') }
        const key = String(index);
        const equals = line.indexOf('=');
        if (/^\s*[#;]/.test(line)) {
            nodes.push(createElement('span', {key: key + 'c', className: 'podshift-code__comment'}, line));
        } else if (equals > 0) {
            nodes.push(createElement('span', {key: key + 'k', className: 'podshift-code__key'}, line.slice(0, equals)));
            nodes.push(createElement('span', {key: key + 'e', className: 'podshift-code__symb'}, '='));
            nodes.push(createElement('span', {key: key + 'v', className: 'podshift-code__string'}, line.slice(equals + 1)));
        } else if (line) {
            nodes.push(line);
        }
    });
    return nodes;
}
