/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Overview card with PodShift and host information.
 *
 * @file InfoCard.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';

import {i18n} from '../../utils/i18n.js';
import {AppInfo} from '../../utils/AppInfo.js';
import {InfoCircleIcon} from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';

import {PropertiesCard} from './PropertiesCard.jsx';
import {useAction} from '../../hooks/useAction.js';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */
/** @typedef {import('../../types/api.js').ActionState} ActionState */
/** @typedef {import('../../types/api.js').OverviewResult} OverviewResult */
/** @typedef {import('../../types/card.js').PropertyRow} PropertyRow */

/**
 * Translated install types, so the words are in the translation template.
 *
 * @type {Record<string, function(): string>}
 */
const INSTALL_TYPES = {
    desktop: () => i18n("Desktop"),
    server: () => i18n("Server"),
};

/**
 * Translates the label and value of the install type row, which the server sends as desktop or server.
 *
 * @param {PropertyRow[]|null} rows Translated server rows, or null before the first load.
 * @returns {PropertyRow[]|null} The rows with the install type translated.
 */
function withInstallType(rows) {
    if (rows == null) { return rows }
    return rows.map(row => {
        if (row.id !== 'install') { return row }
        const known = typeof row.value === 'string' && Object.prototype.hasOwnProperty.call(INSTALL_TYPES, row.value);
        return {...row, label: i18n("Install type"), value: known ? INSTALL_TYPES[row.value]() : row.value};
    });
}

/**
 * Adds the PodShift UI version after the server's PodShift row, when those rows have loaded.
 *
 * @param {PropertyRow[]|null} rows Translated server rows, or null before the first load.
 * @returns {PropertyRow[]|null} The rows with the UI version, or the original value when it cannot be inserted.
 */
function withUiVersion(rows) {
    if (rows == null) { return rows }
    const index = rows.findIndex(row => row.id === 'podshift');
    if (index === -1) { return rows }
    const uiRow = {id: 'podshift-ui', label: i18n("PodShift UI"), value: AppInfo.VERSION};
    return [...rows.slice(0, index + 1), uiRow, ...rows.slice(index + 1)];
}

/**
 * Shows PodShift and host information, loaded once per refresh. Needs admin access.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @returns {React.ReactElement} The card.
 */
export function InfoCard({mode}) {
    const admin = mode === 'admin';
    /** @type {ActionState<OverviewResult>} */
    const {rows, loading, error} = useAction('overview-info', {enabled: admin});
    return (
        <PropertiesCard
            id="podshift-info"
            icon={<InfoCircleIcon/>}
            title={i18n("Info")}
            rows={withUiVersion(withInstallType(rows))}
            alignValues="end"
            loading={loading}
            error={error}
            unavailable={admin ? null : i18n("Requires administrative access")}
        />
    );
}
