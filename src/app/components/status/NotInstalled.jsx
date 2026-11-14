/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Page shown when the PodShift handler is missing.
 *
 * @file NotInstalled.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {EmptyState, EmptyStateBody, EmptyStateVariant} from '@patternfly/react-core/dist/esm/components/EmptyState';
import {Page} from '@patternfly/react-core/dist/esm/components/Page';
import {ExclamationCircleIcon} from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

import {i18n} from '../../utils/i18n.js';

/**
 * Tells the user that the PodShift handler was not found.
 *
 * @returns {React.ReactElement} The not-installed page.
 */
export function NotInstalled() {
    return (
        <Page className="pf-m-no-sidebar">
            <EmptyState
                headingLevel="h1"
                titleText={i18n("PodShift is not installed")}
                variant={EmptyStateVariant.sm}
                icon={ExclamationCircleIcon}
            >
                <EmptyStateBody>
                    {i18n("The PodShift Cockpit handler was not found on this system.")}
                </EmptyStateBody>
            </EmptyState>
        </Page>
    );
}
