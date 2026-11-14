/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Overview page: the Status, Usage, Info, Configuration and Health cards.
 * When the administrator has no environment tag set, a warning is shown
 * under the tabs, above the cards.
 *
 * @file OverviewPage.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {Alert} from '@patternfly/react-core/dist/esm/components/Alert';
import {Gallery} from '@patternfly/react-core/dist/esm/layouts/Gallery';

import {i18n} from '../../utils/i18n.js';

import {ConfigurationCard} from './ConfigurationCard.jsx';
import {HealthCard} from './HealthCard.jsx';
import {InfoCard} from './InfoCard.jsx';
import {StatusCard} from './StatusCard.jsx';
import {UsageCard} from './UsageCard.jsx';
import {useAction} from '../../hooks/useAction.js';

import './overview.scss';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */
/** @typedef {import('../../types/api.js').ActionState} ActionState */
/** @typedef {import('../../types/api.js').OverviewResult} OverviewResult */

/**
 * Shows the cards in the same grid as Cockpit's Overview page: Status | Usage, Info | Configuration, Health.
 * Only this page is mounted, so card polling stops when you leave Overview.
 * Loads the configuration once so the page can warn when TSV_ENV is unset, and passes those rows to the Configuration card.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @returns {React.ReactElement} The page content.
 */
export function OverviewPage({mode}) {
    const admin = mode === 'admin';
    /** @type {ActionState<OverviewResult>} */
    const {rows, loading, error, data} = useAction('overview-config', {poll: 30000, enabled: admin});
    const envRow = (data?.rows || []).find(row => row.id === 'tsv_env');
    const envValue = envRow ? envRow.value : undefined;
    const showEnvNotice = admin && !loading && envRow != null && (envValue == null || envValue === '');

    return (
        <>
            {showEnvNotice && (
                <Alert
                    className="podshift-overview-env-notice"
                    variant="warning"
                    isInline
                    title={i18n("Environment is not set")}
                >
                    {i18n("Set the environment tag as root with")} <code>sudo podshift env --set &lt;tag&gt;</code>
                </Alert>
            )}
            <Gallery className="ct-system-overview" hasGutter>
                <StatusCard mode={mode}/>
                <UsageCard mode={mode}/>
                <InfoCard mode={mode}/>
                <ConfigurationCard mode={mode} rows={rows} loading={loading} error={error}/>
                <HealthCard mode={mode}/>
            </Gallery>
        </>
    );
}
