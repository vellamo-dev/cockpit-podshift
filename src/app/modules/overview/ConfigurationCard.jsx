/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Overview card with the PodShift configuration.
 *
 * @file ConfigurationCard.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';

import {i18n} from '../../utils/i18n.js';
import {CogIcon} from '@patternfly/react-icons/dist/esm/icons/cog-icon';

import {PropertiesCard} from './PropertiesCard.jsx';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */
/** @typedef {import('../../types/card.js').PropertyRow} PropertyRow */

/**
 * Shows the PodShift configuration. Needs admin access.
 * The parent loads the rows, so the Overview page can also warn when TSV_ENV is unset.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @param {PropertyRow[]|null} props.rows Translated rows, or null before the first load.
 * @param {boolean} props.loading True while the first load runs.
 * @param {Error|null} props.error Error of the last load, or null.
 * @returns {React.ReactElement} The card.
 */
export function ConfigurationCard({mode, rows, loading, error}) {
    const admin = mode === 'admin';
    return (
        <PropertiesCard
            id="podshift-configuration"
            icon={<CogIcon/>}
            title={i18n("Configuration")}
            rows={rows}
            alignValues="end"
            loading={loading}
            error={error}
            unavailable={admin ? null : i18n("Requires administrative access")}
        />
    );
}
