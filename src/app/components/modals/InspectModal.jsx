/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shows the podman inspect JSON of one resource, coloured, in a CodeViewModal, with Download.
 * Generic: containers, images, volumes and networks all use it.
 *
 * @file InspectModal.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useMemo, useState} from 'react';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';
import {DownloadIcon} from '@patternfly/react-icons/dist/esm/icons/download-icon';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {highlightJson} from '../../utils/highlightJson.js';
import {inspectFileName} from '../../utils/resourceName.js';
import {InspectResource} from '../../api/InspectResource.js';

import {CodeViewModal} from './CodeViewModal.jsx';
import {InlineNotice} from '../common/InlineNotice.jsx';
import {InspectNotice} from './InspectNotice.jsx';

/** @typedef {import('../../types/inspect.js').InspectData} InspectData */
/** @typedef {import('../../types/inspect.js').InspectKind} InspectKind */

/**
 * Shows the inspect JSON of one resource in a large modal. Download saves
 * <kind>-<name>-inspect.json, always through file mode and a cockpit-ws external channel, both
 * when the JSON is shown and when it is too large to show.
 *
 * @param {object} props Component props.
 * @param {boolean} [props.isOpen] True while the modal is shown.
 * @param {InspectKind} props.kind Resource kind.
 * @param {string} props.resourceRef Name or ID passed to the inspect action.
 * @param {string} props.name Display name of the resource, shown in the title.
 * @param {InspectData|null} [props.data] Parsed inspect output; null while loading, on error, not found or too large.
 * @param {boolean} [props.loading] True while the data loads.
 * @param {Error|null} [props.error] Error of the load.
 * @param {boolean} [props.notFound] True when the resource no longer exists.
 * @param {number|null} [props.tooLargeSize] Byte size of an output too large to show, or null.
 * @param {() => void} [props.onRefresh] Closes the modal and reloads the list.
 * @param {() => void} props.onClose Called when the modal is closed.
 * @returns {React.ReactElement} The modal.
 */
export function InspectModal({
    isOpen = true, kind, resourceRef, name, data = null, loading = false, error = null,
    notFound = false, tooLargeSize = null, onRefresh, onClose
}) {
    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState(/** @type {Error|null} */ (null));
    const [gone, setGone] = useState(false);
    const text = useMemo(() => (data == null ? '' : JSON.stringify(data, null, 4) + '\n'), [data]);
    const code = useMemo(() => highlightJson(text), [text]);
    const missing = notFound || gone;
    const notice = (missing || tooLargeSize != null)
        ? (
            <InspectNotice
                kind={kind}
                resourceRef={resourceRef}
                name={name}
                notFound={missing}
                tooLargeSize={tooLargeSize}
                onRefresh={onRefresh}
            />
        )
        : null;
    const canDownload = !missing && (data != null || tooLargeSize != null);

    /**
     * Saves the inspect JSON as a file, written by the handler in file mode.
     */
    async function download() {
        setDownloadError(null);
        setDownloading(true);
        try {
            await InspectResource.downloadInspect(kind, resourceRef, inspectFileName(kind, name));
        } catch (e) {
            if (/** @type {any} */ (e).code === 'NOT_FOUND') { setGone(true) } else { setDownloadError(e) }
        } finally {
            setDownloading(false);
        }
    }

    return (
        <CodeViewModal
            isOpen={isOpen}
            title={cockpit.format(i18n("Inspect: $0"), name)}
            text={text}
            code={code}
            loading={loading || (data == null && !notice)}
            error={error}
            notice={notice}
            alert={downloadError && (
                <InlineNotice variant="danger" title={downloadError}/>
            )}
            onClose={onClose}
            actions={(
                <Button
                    variant="secondary"
                    icon={<DownloadIcon/>}
                    isDisabled={!canDownload || downloading}
                    isLoading={downloading}
                    onClick={() => download()}
                >
                    {i18n("Download")}
                </Button>
            )}
        />
    );
}
