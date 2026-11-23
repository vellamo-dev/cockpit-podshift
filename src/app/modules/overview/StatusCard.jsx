/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Overview card with the PodShift service status.
 *
 * @file StatusCard.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';

import {i18n} from '../../utils/i18n.js';
import {CheckCircleIcon} from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';

import {PropertiesCard} from './PropertiesCard.jsx';
import {useAction} from '../../hooks/useAction.js';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */
/** @typedef {import('../../types/api.js').ActionState} ActionState */
/** @typedef {import('../../types/api.js').OverviewResult} OverviewResult */

/**
 * Shows the PodShift service status, reloaded every 30 seconds while auto refresh is on. Needs admin access.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @returns {React.ReactElement} The card.
 */
export function StatusCard({mode}) {
    const admin = mode === 'admin';
    /** @type {ActionState<OverviewResult>} */
    const {rows, loading, error} = useAction('overview-status', {poll: 30000, enabled: admin});
    return (
        <PropertiesCard
            id="podshift-status"
            icon={<CheckCircleIcon/>}
            title={i18n("Status")}
            rows={rows}
            alignValues="end"
            loading={loading}
            error={error}
            unavailable={admin ? null : i18n("Requires administrative access")}
        />
    );
}
