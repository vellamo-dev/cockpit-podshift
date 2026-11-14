/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * PatternFly status icon for a health-check state.
 *
 * @file HealthStatusIcon.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {Icon} from '@patternfly/react-core/dist/esm/components/Icon';
import {CheckCircleIcon} from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import {ExclamationCircleIcon} from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import {ExclamationTriangleIcon} from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import {InfoCircleIcon} from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';

/** @typedef {import('../../types/health.js').HealthState} HealthState */

/**
 * Shows the status icon for a health-check state: ok, note, warn or fail.
 *
 * @param {object} props Component props.
 * @param {HealthState} props.state State of the check; anything unknown shows as fail.
 * @returns {React.ReactElement} The coloured status icon.
 */
export function HealthStatusIcon({state}) {
    switch (state) {
    case 'ok':
        return <Icon status="success"><CheckCircleIcon/></Icon>;
    case 'note':
        return <Icon status="info"><InfoCircleIcon/></Icon>;
    case 'warn':
        return <Icon status="warning"><ExclamationTriangleIcon/></Icon>;
    default:
        return <Icon status="danger"><ExclamationCircleIcon/></Icon>;
    }
}
