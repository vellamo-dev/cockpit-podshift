/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * The open code view of a resource tab: Inspect or Variables, loaded from the inspect action.
 *
 * @file ResourceViewModal.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useMemo} from 'react';

import {EnvVariables} from '../../utils/EnvVariables.js';
import {useInspect} from '../../hooks/useInspect.js';

import {InspectModal} from './InspectModal.jsx';
import {VariablesModal} from './VariablesModal.jsx';

/** @typedef {import('../../types/inspect.js').InspectKind} InspectKind */
/** @typedef {import('../../types/inspect.js').ResourceView} ResourceView */

/**
 * Shows the open view of a tab, or nothing. The inspect action runs only while a view is open.
 * Variables come from Config.Env of the same inspect object. Refresh, shown when the resource
 * no longer exists, closes the view and reloads the tab's list.
 *
 * @param {object} props Component props.
 * @param {InspectKind} props.kind Resource kind of the tab.
 * @param {ResourceView|null} props.view The open view, or null.
 * @param {() => void} props.onClose Called when the view is closed.
 * @param {() => void} [props.onRefresh] Reloads the tab's list, for example refresh from useAction.
 * @returns {React.ReactElement|null} The modal, or null when no view is open.
 */
export function ResourceViewModal({kind, view, onClose, onRefresh}) {
    const {data, notFound, tooLargeSize, error, loading} = useInspect(kind, view ? view.ref : null);
    const variables = useMemo(
        () => (data == null ? null : EnvVariables.envFromList(data.Config?.Env)),
        [data]
    );

    if (!view) { return null }

    /**
     * Closes the view, then reloads the list so the gone resource disappears.
     */
    function refresh() {
        onClose();
        if (onRefresh) { onRefresh() }
    }

    const shared = {
        kind,
        resourceRef: view.ref,
        name: view.name,
        loading,
        error,
        notFound,
        tooLargeSize,
        onRefresh: refresh,
        onClose,
    };
    if (view.mode === 'variables') { return <VariablesModal {...shared} variables={variables}/> }
    return <InspectModal {...shared} data={data}/>;
}
