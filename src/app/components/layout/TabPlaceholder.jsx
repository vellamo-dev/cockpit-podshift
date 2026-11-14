/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Placeholder for a tab that has no content yet.
 *
 * @file TabPlaceholder.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {EmptyState, EmptyStateBody, EmptyStateVariant} from '@patternfly/react-core/dist/esm/components/EmptyState';

import {i18n} from '../../utils/i18n.js';

// noinspection JSUnusedGlobalSymbols
/**
 * Shows a "Coming soon" note for a tab that has no content yet.
 *
 * @param {object} props Component props.
 * @param {string} props.title Tab name, shown as the heading.
 * @returns {React.ReactElement} The placeholder.
 */
export function TabPlaceholder({title}) {
    return (
        <EmptyState headingLevel="h2" titleText={title} variant={EmptyStateVariant.sm}>
            <EmptyStateBody>{i18n("Coming soon.")}</EmptyStateBody>
        </EmptyState>
    );
}
