/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Status view of one service on the Services tab, from the service-view action. The unit file
 * is shown by UnitViewModal.
 *
 * @file ServiceStatusModal.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {AlertActionLink} from '@patternfly/react-core/dist/esm/components/Alert';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {useActionResult} from '../../hooks/useActionResult.js';
import {serviceDisplayName} from '../../utils/resourceName.js';

import {CodeViewModal} from './CodeViewModal.jsx';
import {InlineNotice} from '../common/InlineNotice.jsx';

/** @typedef {import('../../types/api.js').ActionResultState} ActionResultState */
/** @typedef {import('../../types/service.js').ServiceItem} ServiceItem */
/** @typedef {import('../../types/service.js').ServiceViewResult} ServiceViewResult */

/**
 * Shows the status of a service as plain text, like `systemctl --user status`. The text is loaded
 * when the view opens. A unit that is gone shows a notice with Refresh, and a text that is too
 * large shows its size. The footer has Copy.
 *
 * @param {object} props Component props.
 * @param {ServiceItem|null} props.service The service whose status is open, or null.
 * @param {() => void} props.onClose Called when the view is closed.
 * @param {() => void} [props.onRefresh] Called by Refresh in the not-found notice, to close the view and reload the list.
 * @returns {React.ReactElement|null} The modal, or null when no view is open.
 */
export function ServiceStatusModal({service, onClose, onRefresh}) {
    const args = service ? {unit: service.id, mode: 'status'} : null;
    /** @type {ActionResultState<ServiceViewResult>} */
    const {data, error, loading} = useActionResult('service-view', args);
    const result = data;
    const text = result?.found && typeof result.text === 'string' ? result.text : '';

    if (!service) { return null }

    let notice = null;
    if (result && !result.found) {
        notice = (
            <InlineNotice
                variant="warning"
                title={cockpit.format(i18n("This $0 no longer exists."), service.id)}
                actionLinks={onRefresh && (
                    <AlertActionLink onClick={onRefresh}>{i18n("Refresh")}</AlertActionLink>
                )}
            />
        );
    } else if (result?.tooLarge) {
        notice = (
            <InlineNotice
                variant="info"
                title={cockpit.format(i18n("The output is too large to show here ($0)."), cockpit.format_bytes(Number(result.size) || 0))}
            />
        );
    }

    return (
        <CodeViewModal
            isOpen
            title={cockpit.format(i18n("Status: $0"), serviceDisplayName(service.id))}
            text={text}
            code={text}
            loading={loading}
            error={error}
            notice={notice}
            onClose={onClose}
        />
    );
}
