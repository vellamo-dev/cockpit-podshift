/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Hook for copy buttons that read "Copied" for a short while after a copy.
 *
 * @file useCopiedFlag.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {useCallback, useEffect, useRef, useState} from 'react';

import {copyText} from '../utils/rowsToText.js';

/**
 * State of a copy button.
 *
 * @typedef {object} CopiedFlag
 * @property {boolean} copied True for a short while after a copy.
 * @property {(text: string) => Promise<void>} copy Copies the text, then sets copied until the delay ends.
 * @property {() => void} reset Clears copied and any pending timer, for example when the text changes.
 */

/**
 * Copies text and keeps a "copied" flag that clears itself after a delay. One timer is held in a
 * ref: a new copy clears the pending timer first, and unmounting clears it, so there is no state
 * update after unmount. A copy that finishes after unmount does not set the flag.
 *
 * @param {number} [delayMs] How long copied stays true, in milliseconds.
 * @returns {CopiedFlag} The flag, the copy function and reset.
 */
export function useCopiedFlag(delayMs = 2000) {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef(/** @type {number|null} */ (null));
    const mountedRef = useRef(false);

    const clearTimer = useCallback(function clearTimer() {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(function trackMount() {
        mountedRef.current = true;
        return function onUnmount() {
            mountedRef.current = false;
            clearTimer();
        };
    }, [clearTimer]);

    const reset = useCallback(function reset() {
        clearTimer();
        setCopied(false);
    }, [clearTimer]);

    const copy = useCallback(function copy(text) {
        return copyText(text).then(function showCopied() {
            if (!mountedRef.current) { return }
            clearTimer();
            setCopied(true);
            timerRef.current = window.setTimeout(function hideCopied() {
                timerRef.current = null;
                setCopied(false);
            }, delayMs);
        });
    }, [clearTimer, delayMs]);

    return {copied, copy, reset};
}
