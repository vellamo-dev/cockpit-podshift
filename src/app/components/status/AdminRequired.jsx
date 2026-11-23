/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Page shown to a user without Cockpit administrative access, instead of the tabs.
 *
 * @file AdminRequired.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {EmptyState, EmptyStateBody, EmptyStateVariant} from '@patternfly/react-core/dist/esm/components/EmptyState';
import {Page} from '@patternfly/react-core/dist/esm/components/Page';
import {LockIcon} from '@patternfly/react-icons/dist/esm/icons/lock-icon';

import {i18n} from '../../utils/i18n.js';

/**
 * Asks the user to turn on Cockpit administrative access, which every PodShift view needs.
 *
 * @returns {React.ReactElement} The page.
 */
export function AdminRequired() {
    return (
        <Page className="pf-m-no-sidebar">
            <EmptyState
                headingLevel="h1"
                titleText={i18n("Requires administrative access")}
                variant={EmptyStateVariant.sm}
                icon={LockIcon}
            >
                <EmptyStateBody>
                    {i18n("Turn on Cockpit administrative access to use PodShift.")}
                </EmptyStateBody>
            </EmptyState>
        </Page>
    );
}
