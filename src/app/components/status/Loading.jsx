/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Page shown while the access check runs.
 *
 * @file Loading.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {EmptyState, EmptyStateVariant} from '@patternfly/react-core/dist/esm/components/EmptyState';
import {Page} from '@patternfly/react-core/dist/esm/components/Page';
import {Spinner} from '@patternfly/react-core/dist/esm/components/Spinner';

import {i18n} from '../../utils/i18n.js';

/**
 * Shows a spinner while the access check runs.
 *
 * @returns {React.ReactElement} The loading page.
 */
export function Loading() {
    return (
        <Page className="pf-m-no-sidebar">
            <EmptyState
                headingLevel="h1"
                titleText={i18n("Checking PodShift access")}
                variant={EmptyStateVariant.sm}
                icon={Spinner}
            />
        </Page>
    );
}
