/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shows the environment variables of a container as NAME=value lines in a CodeViewModal,
 * with secret values masked until "Show secrets" is used.
 *
 * @file VariablesModal.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useMemo, useState} from 'react';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';
import {EyeIcon} from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import {EyeSlashIcon} from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {EnvVariables} from '../../utils/EnvVariables.js';
import {highlightIni} from '../../utils/highlightIni.js';

import {CodeViewModal} from './CodeViewModal.jsx';
import {InspectNotice} from './InspectNotice.jsx';

/** @typedef {import('../../types/container.js').EnvVariable} EnvVariable */
/** @typedef {import('../../types/inspect.js').InspectKind} InspectKind */

/**
 * Shows the variables of one container in a large modal.
 *
 * @param {object} props Component props.
 * @param {boolean} [props.isOpen] True while the modal is shown.
 * @param {InspectKind} props.kind Resource kind, for the too-large command.
 * @param {string} props.resourceRef Name or ID passed to the inspect action.
 * @param {string} props.name Display name of the container, shown in the title.
 * @param {EnvVariable[]|null} [props.variables] The variables; null while loading, on error, not found or too large.
 * @param {boolean} [props.loading] True while the data loads.
 * @param {Error|null} [props.error] Error of the load.
 * @param {boolean} [props.notFound] True when the container no longer exists.
 * @param {number|null} [props.tooLargeSize] Byte size of an inspect output too large to show, or null.
 * @param {() => void} [props.onRefresh] Closes the modal and reloads the list.
 * @param {() => void} props.onClose Called when the modal is closed.
 * @returns {React.ReactElement} The modal.
 */
export function VariablesModal({
    isOpen = true, kind, resourceRef, name, variables = null, loading = false, error = null,
    notFound = false, tooLargeSize = null, onRefresh, onClose
}) {
    const [showSecrets, setShowSecrets] = useState(false);
    const text = useMemo(() => (variables == null ? '' : EnvVariables.envToText(variables, showSecrets)), [variables, showSecrets]);
    const code = useMemo(() => highlightIni(text), [text]);
    const notice = (notFound || tooLargeSize != null)
        ? (
            <InspectNotice
                kind={kind}
                resourceRef={resourceRef}
                name={name}
                notFound={notFound}
                tooLargeSize={tooLargeSize}
                onRefresh={onRefresh}
            />
        )
        : null;
    return (
        <CodeViewModal
            isOpen={isOpen}
            title={cockpit.format(i18n("Variables: $0"), name)}
            text={text}
            code={code}
            loading={loading || (variables == null && !notice)}
            error={error}
            notice={notice}
            onClose={onClose}
            actions={(
                <Button
                    variant="secondary"
                    icon={showSecrets ? <EyeSlashIcon/> : <EyeIcon/>}
                    isDisabled={variables == null}
                    onClick={() => setShowSecrets(!showSecrets)}
                >
                    {showSecrets ? i18n("Hide secrets") : i18n("Show secrets")}
                </Button>
            )}
        />
    );
}
