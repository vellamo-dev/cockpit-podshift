/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Hook that loads the podman inspect object of one resource while its view is open.
 *
 * @file useInspect.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {useEffect, useState} from 'react';

import {InspectResource} from '../api/InspectResource.js';

/** @typedef {import('../types/inspect.js').InspectKind} InspectKind */
/** @typedef {import('../types/inspect.js').InspectResult} InspectResult */
/** @typedef {import('../types/inspect.js').InspectState} InspectState */

/**
 * Loads the inspect result of one resource. Nothing is loaded while ref is empty, so the
 * handler runs only when a view opens. A result that arrives after ref changed is dropped.
 *
 * @param {InspectKind} kind Resource kind.
 * @param {string|null} ref Name or ID, or null while no view is open.
 * @returns {InspectState} The object, not-found and too-large flags, the error and the loading flag.
 */
export function useInspect(kind, ref) {
    const [result, setResult] = useState(/** @type {InspectResult|null} */ (null));
    const [error, setError] = useState(/** @type {Error|null} */ (null));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setResult(null);
        setError(null);
        if (!ref) {
            setLoading(false);
            return undefined;
        }
        let current = true;
        setLoading(true);
        InspectResource.inspectResource(kind, ref)
                .then(value => {
                    if (current) { setResult(value) }
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
    }, [kind, ref]);

    const found = Boolean(result?.found);
    return {
        data: found && result?.object ? result.object : null,
        notFound: Boolean(result) && !found,
        tooLargeSize: found && result?.tooLarge ? Number(result.size) || 0 : null,
        error,
        loading,
    };
}
