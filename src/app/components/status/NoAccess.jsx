/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Page shown when the user has no PodShift access.
 *
 * @file NoAccess.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {EmptyState, EmptyStateBody, EmptyStateVariant} from '@patternfly/react-core/dist/esm/components/EmptyState';
import {Page} from '@patternfly/react-core/dist/esm/components/Page';
import {LockIcon} from '@patternfly/react-icons/dist/esm/icons/lock-icon';

import {i18n} from '../../utils/i18n.js';

/**
 * Tells the user how to get access: the podshift user or Cockpit admin access.
 *
 * @returns {React.ReactElement} The no-access page.
 */
export function NoAccess() {
    return (
        <Page className="pf-m-no-sidebar">
            <EmptyState
                headingLevel="h1"
                titleText={i18n("No access")}
                variant={EmptyStateVariant.sm}
                icon={LockIcon}
            >
                <EmptyStateBody>
                    {i18n("Log in as the podshift user, or turn on Cockpit administrative access.")}
                </EmptyStateBody>
            </EmptyState>
        </Page>
    );
}
