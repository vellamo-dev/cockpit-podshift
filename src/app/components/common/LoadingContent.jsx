/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared loading, error, empty and stale-data states for tabs and cards.
 *
 * @file LoadingContent.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {EmptyState, EmptyStateBody, EmptyStateVariant} from '@patternfly/react-core/dist/esm/components/EmptyState';
import {Spinner} from '@patternfly/react-core/dist/esm/components/Spinner';
import {StackItem} from '@patternfly/react-core/dist/esm/layouts/Stack';

import {InlineNotice} from './InlineNotice.jsx';

/** @typedef {import('../../types/notice.js').WarningPlacement} WarningPlacement */

/**
 * Wraps a terminal state (unavailable, first-load spinner or first-load error).
 * On resource tabs the state sits in a StackItem, like the old content slot.
 *
 * @param {WarningPlacement} placement Where a later stale warning would sit.
 * @param {React.ReactElement} node The notice or spinner.
 * @returns {React.ReactElement} The terminal state.
 */
function wrapState(placement, node) {
    if (placement === 'stack') { return <StackItem>{node}</StackItem> }
    return node;
}

/**
 * Places a stale-data warning next to the loaded body, in the layout the parent used before.
 *
 * @param {WarningPlacement} placement Where the warning is shown.
 * @param {Error|null} error Error of a failed refresh; no warning when it is null.
 * @param {React.ReactNode} body The loaded body, or the empty state.
 * @returns {React.ReactNode} The warning and the body.
 */
function withWarning(placement, error, body) {
    if (placement === 'stack') {
        if (!error) { return <StackItem>{body}</StackItem> }
        return (
            <>
                <StackItem>
                    <InlineNotice variant="warning" title={error}/>
                </StackItem>
                <StackItem>{body}</StackItem>
            </>
        );
    }

    if (placement === 'none' || !error) { return body }

    return (
        <>
            <InlineNotice variant="warning" title={error}/>
            {body}
        </>
    );
}

/**
 * Picks the content to show for a load: unavailable, a first-load spinner, a first-load
 * error, an empty state, or the loaded body. A failed refresh after data has loaded
 * shows a warning, whose placement follows the parent layout.
 *
 * Precedence: unavailable, then loading without data, then error without data, then
 * the empty state or the children. The stale warning is shown only once data exists.
 *
 * @param {object} props Component props.
 * @param {string|null} [props.unavailable] Text shown when the view cannot be used, for example without admin access.
 * @param {boolean} [props.loading] True while the first load runs.
 * @param {Error|null} [props.error] Error of the last load; a warning when data already exists, a danger notice when it does not.
 * @param {boolean} [props.hasData] True when a result has already loaded.
 * @param {boolean} [props.isEmpty] True when there is nothing to show, for example no filter matches.
 * @param {string} [props.emptyTitle] Title of the empty state; used when isEmpty is true.
 * @param {string} [props.emptyBody] Body of the empty state; used when isEmpty is true.
 * @param {'md'|'lg'} [props.spinnerSize] Size of the first-load spinner.
 * @param {WarningPlacement} [props.warningPlacement] Where a stale-data warning sits: before the body, as StackItems, or not at all.
 * @param {React.ReactNode} [props.children] The loaded body, shown when none of the other states apply.
 * @returns {React.ReactNode} The chosen state.
 */
export function LoadingContent({
    unavailable = null,
    loading = false,
    error = null,
    hasData = false,
    isEmpty = false,
    emptyTitle,
    emptyBody,
    spinnerSize = 'lg',
    warningPlacement = 'before',
    children
}) {
    if (unavailable) { return wrapState(warningPlacement, <InlineNotice variant="info" title={unavailable}/>) }
    if (loading && !hasData) { return wrapState(warningPlacement, <Spinner size={spinnerSize}/>) }
    if (error && !hasData) { return wrapState(warningPlacement, <InlineNotice variant="danger" title={error}/>) }

    const body = isEmpty
        ? (
            <EmptyState headingLevel="h2" titleText={emptyTitle} variant={EmptyStateVariant.sm}>
                {emptyBody ? <EmptyStateBody>{emptyBody}</EmptyStateBody> : null}
            </EmptyState>
        )
        : children;

    return withWarning(warningPlacement, error, body);
}
