/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Show log view of one service on the Services tab: the last journal entries of the unit
 * from the service-logs action, in short-iso style, coloured by priority, newest at the bottom.
 *
 * @file ServiceLogModal.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useMemo} from 'react';
import {AlertActionLink} from '@patternfly/react-core/dist/esm/components/Alert';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';
import {EmptyState, EmptyStateVariant} from '@patternfly/react-core/dist/esm/components/EmptyState';
import {ExternalLinkAltIcon} from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import {SyncAltIcon} from '@patternfly/react-icons/dist/esm/icons/sync-alt-icon';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {JournalText} from '../../utils/JournalText.js';
import {CockpitLinks} from '../../utils/CockpitLinks.js';
import {useActionResult} from '../../hooks/useActionResult.js';
import {serviceDisplayName} from '../../utils/resourceName.js';

import {CodeViewModal} from './CodeViewModal.jsx';
import {InlineNotice} from '../common/InlineNotice.jsx';

import './ServiceLogModal.scss';

/** @typedef {import('../../types/api.js').ActionResultState} ActionResultState */
/** @typedef {import('../../types/service.js').ServiceItem} ServiceItem */
/** @typedef {import('../../types/service.js').ServiceLogResult} ServiceLogResult */

/**
 * Shows the log of a service, loaded when the view opens and again by Refresh. A unit that is
 * gone and a journal that cannot be read (with the handler's reason) show a warning; an empty
 * log shows a plain No log entries state, and Copy is then disabled. The footer has Copy,
 * Refresh and, for admins, Open log, which opens Cockpit's Logs page for the unit.
 *
 * @param {object} props Component props.
 * @param {ServiceItem|null} props.service The service, or null when no log is open.
 * @param {boolean} props.admin True when the user has admin access; Open log is shown only then.
 * @param {() => void} props.onClose Called when the view is closed.
 * @param {() => void} [props.onRefresh] Called by Refresh in the not-found notice, to close the view and reload the list.
 * @returns {React.ReactElement|null} The modal, or null when no log is open.
 */
export function ServiceLogModal({service, admin, onClose, onRefresh}) {
    const args = service ? {unit: service.id} : null;
    /** @type {ActionResultState<ServiceLogResult>} */
    const {data, error, loading, reload} = useActionResult('service-logs', args);
    const result = data;
    const entries = useMemo(
        () => (result?.found && Array.isArray(result.entries) ? result.entries : []),
        [result]
    );
    const text = useMemo(() => JournalText.toText(entries), [entries]);
    const code = useMemo(() => JournalText.highlight(entries), [entries]);

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
    } else if (result?.readable === false) {
        notice = (
            <InlineNotice variant="warning" title={i18n("The journal of the podshift user cannot be read.")}>
                {result.reason}
            </InlineNotice>
        );
    } else if (result && entries.length === 0) {
        // A unit that never ran has an empty journal; Cockpit shows the same text.
        notice = <EmptyState headingLevel="h2" titleText={i18n("No log entries")} variant={EmptyStateVariant.sm}/>;
    }

    return (
        <CodeViewModal
            isOpen
            title={cockpit.format(i18n("Log: $0"), serviceDisplayName(service.id))}
            text={entries.length > 0 ? text : ''}
            code={code}
            loading={loading}
            error={error}
            notice={notice}
            onClose={onClose}
            endActions={(
                <>
                    <Button variant="secondary" icon={<SyncAltIcon/>} isDisabled={loading} onClick={reload}>
                        {i18n("Refresh")}
                    </Button>
                    {admin && (
                        <Button variant="link" icon={<ExternalLinkAltIcon/>} iconPosition="end" onClick={() => CockpitLinks.openServiceLog(service.id)}>
                            {i18n("Open log")}
                        </Button>
                    )}
                </>
            )}
        />
    );
}
