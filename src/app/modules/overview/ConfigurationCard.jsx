/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Overview card with the PodShift configuration, where custom variables and the environment tag can be changed.
 *
 * @file ConfigurationCard.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useState} from 'react';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';

import {i18n} from '../../utils/i18n.js';
import {CogIcon} from '@patternfly/react-icons/dist/esm/icons/cog-icon';

import {ConfigVariableModal} from '../../components/modals/ConfigVariableModal.jsx';
import {EnvTagModal} from '../../components/modals/EnvTagModal.jsx';
import {useCapability} from '../../hooks/CapabilitiesContext.js';
import {PropertiesCard} from './PropertiesCard.jsx';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */
/** @typedef {import('../../types/api.js').ConfigRow} ConfigRow */
/** @typedef {import('../../types/api.js').OverviewConfigResult} OverviewConfigResult */
/** @typedef {import('../../types/card.js').ConfigModalMode} ConfigModalMode */
/** @typedef {import('../../types/card.js').PropertyRow} PropertyRow */

/**
 * The open modal of the card: none, the variable modal in add or edit mode, or the environment tag modal.
 *
 * @typedef {{kind: 'none'}|{kind: 'variable', mode: ConfigModalMode, row?: ConfigRow}|{kind: 'env'}} OpenModal
 */

/**
 * Shows the PodShift configuration. Needs admin access.
 * The parent loads the rows, so the Overview page can also warn when TSV_ENV is unset.
 * The kebab menu adds a variable. An editable value is a link that opens the edit modal;
 * an unset TSV_ENV opens the environment tag modal. TSV_NW* rows and a set TSV_ENV are read-only.
 * Without the config-set action there is no Add variable and no edit link; without env-set, TSV_ENV is not a link.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @param {PropertyRow[]|null} props.rows Translated rows, or null before the first load.
 * @param {OverviewConfigResult|null} [props.data] Raw data with the editable flags and tag suggestions.
 * @param {boolean} props.loading True while the first load runs.
 * @param {Error|null} props.error Error of the last load, or null.
 * @param {() => void} [props.onChanged] Called after a variable or the tag was changed, to reload the rows.
 * @returns {React.ReactElement} The card.
 */
export function ConfigurationCard({mode, rows, data = null, loading, error, onChanged}) {
    const admin = mode === 'admin';
    const [open, setOpen] = useState(/** @type {OpenModal} */ ({kind: 'none'}));
    const rawRows = data?.rows || [];
    const canEdit = useCapability('config-set');
    const canSetEnv = useCapability('env-set');

    /**
     * Closes the modal and reloads the rows after a change.
     */
    function saved() {
        setOpen({kind: 'none'});
        if (onChanged) {
            onChanged();
        }
    }

    /**
     * Returns an edit link for an editable row, or undefined for a read-only row.
     *
     * @param {PropertyRow} row The translated row.
     * @returns {React.ReactNode|undefined} The value cell content.
     */
    function rowValue(row) {
        const raw = rawRows.find(item => item.id === row.id);
        if (!admin || !raw || !raw.editable) {
            return undefined;
        }
        if (raw.id === 'tsv_env' && !canSetEnv) {
            return undefined;
        }
        if (raw.id !== 'tsv_env' && !canEdit) {
            return undefined;
        }
        if (raw.id === 'tsv_env') {
            return (
                <Button variant="link" isInline onClick={() => setOpen({kind: 'env'})}>
                    {row.value}
                </Button>
            );
        }
        return (
            <Button variant="link" isInline onClick={() => setOpen({kind: 'variable', mode: 'edit', row: raw})}>
                {row.value}
            </Button>
        );
    }

    /** @type {import('../../types/card.js').MenuItem[]} */
    const actions = [];
    if (canEdit) {
        actions.push({
            key: 'add-variable',
            label: i18n("Add variable"),
            isDisabled: !admin || data == null,
            onClick: () => setOpen({kind: 'variable', mode: 'add'})
        });
    }

    return (
        <>
            <PropertiesCard
                id="podshift-configuration"
                icon={<CogIcon/>}
                title={i18n("Configuration")}
                rows={rows}
                alignValues="end"
                loading={loading}
                error={error}
                unavailable={admin ? null : i18n("Requires administrative access")}
                actions={actions}
                rowValue={row => rowValue(row)}
            />
            {open.kind === 'variable' && (
                <ConfigVariableModal
                    mode={open.mode}
                    initialKey={open.row?.label}
                    initialValue={open.row?.value ?? ''}
                    onClose={() => setOpen({kind: 'none'})}
                    onSaved={() => saved()}
                />
            )}
            {open.kind === 'env' && (
                <EnvTagModal
                    suggestions={data?.envSuggestions || []}
                    onClose={() => setOpen({kind: 'none'})}
                    onSaved={() => saved()}
                />
            )}
        </>
    );
}
