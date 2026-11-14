/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Overview card with the resource usage.
 *
 * @file UsageCard.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';

import {i18n} from '../../utils/i18n.js';
import {TachometerAltIcon} from '@patternfly/react-icons/dist/esm/icons/tachometer-alt-icon';

import {PropertiesCard} from './PropertiesCard.jsx';
import {useAction} from '../../hooks/useAction.js';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */
/** @typedef {import('../../types/api.js').ActionState} ActionState */
/** @typedef {import('../../types/api.js').OverviewResult} OverviewResult */

/**
 * Shows the resource usage, reloaded every 30 seconds. Needs admin access.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @returns {React.ReactElement} The card.
 */
export function UsageCard({mode}) {
    const admin = mode === 'admin';
    /** @type {ActionState<OverviewResult>} */
    const {rows, loading, error} = useAction('overview-usage', {poll: 30000, enabled: admin});
    return (
        <PropertiesCard
            id="podshift-usage"
            icon={<TachometerAltIcon/>}
            title={i18n("Usage")}
            rows={rows}
            alignValues="end"
            loading={loading}
            error={error}
            unavailable={admin ? null : i18n("Requires administrative access")}
            rowTab={row => row.id}
        />
    );
}
