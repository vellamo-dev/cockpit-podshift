/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Hook that loads one handler action with arguments while a view is open.
 *
 * @file useActionResult.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {useCallback, useEffect, useState} from 'react';

import {PodShiftApi} from '../api/PodShiftApi.js';

/** @typedef {import('../types/api.js').ActionResultState} ActionResultState */
/** @typedef {import('../types/api.js').ActionDataMap} ActionDataMap */

/**
 * Loads one action with the given arguments. Nothing is loaded while args is null, so the
 * handler runs only when a view opens. Each load, also by reload(), clears the last result.
 * A result that arrives after the arguments changed or the view closed is dropped.
 *
 * @template {keyof ActionDataMap} A
 * @param {A} action Action name, for example 'service-view'.
 * @param {object|null} args Action arguments, or null while no view is open.
 * @returns {ActionResultState<ActionDataMap[A]>} The data, the error, the loading flag and a reload function.
 */
export function useActionResult(action, args) {
    const key = args ? JSON.stringify(args) : null;
    const [data, setData] = useState(/** @type {ActionDataMap[A]|null} */ (null));
    const [error, setError] = useState(/** @type {Error|null} */ (null));
    const [loading, setLoading] = useState(false);
    const [round, setRound] = useState(0);

    useEffect(() => {
        setData(null);
        setError(null);
        if (key == null) {
            setLoading(false);
            return undefined;
        }
        let current = true;
        setLoading(true);
        PodShiftApi.callAction(action, JSON.parse(key))
                .then(value => {
                    if (current) { setData(value) }
                })
                .catch(e => {
                    if (current) { setError(e) }
                })
                .finally(() => {
                    if (current) { setLoading(false) }
                });
        return () => {
            current = false;
        };
    }, [action, key, round]);

    const reload = useCallback(() => setRound(value => value + 1), []);
    return {data, error, loading, reload};
}
