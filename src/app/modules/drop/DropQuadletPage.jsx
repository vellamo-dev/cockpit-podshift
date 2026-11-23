/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Drop-quadlet page: a drop zone that uploads one Quadlet file or .zip bundle with the
 * quadlet-drop action, the drop history (quadlet-drop-history), and the install log
 * (quadlet-install-log).
 *
 * @file DropQuadletPage.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Card, CardBody, CardHeader, CardTitle} from '@patternfly/react-core/dist/esm/components/Card';
import {CodeBlock, CodeBlockCode} from '@patternfly/react-core/dist/esm/components/CodeBlock';
import {Icon} from '@patternfly/react-core/dist/esm/components/Icon';
import {
    MultipleFileUpload,
    MultipleFileUploadContext,
    MultipleFileUploadMain
} from '@patternfly/react-core/dist/esm/components/MultipleFileUpload';
import {Spinner} from '@patternfly/react-core/dist/esm/components/Spinner';
import {Tooltip} from '@patternfly/react-core/dist/esm/components/Tooltip';
import {Stack, StackItem} from '@patternfly/react-core/dist/esm/layouts/Stack';
import {AttentionBellIcon} from '@patternfly/react-icons/dist/esm/icons/attention-bell-icon';
import {BanIcon} from '@patternfly/react-icons/dist/esm/icons/ban-icon';
import {CheckCircleIcon} from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import {ExclamationCircleIcon} from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import {ImportIcon} from '@patternfly/react-icons/dist/esm/icons/import-icon';
import {InProgressIcon} from '@patternfly/react-icons/dist/esm/icons/in-progress-icon';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {DropFileRules} from '../../utils/DropFileRules.js';
import {DropStatus} from '../../utils/DropStatus.js';
import {formatDateTime} from '../../utils/formatDateTime.js';
import {JournalText} from '../../utils/JournalText.js';
import {LogOrder} from '../../utils/LogOrder.js';
import {CardActionsMenu} from '../../components/resource/CardActionsMenu.jsx';
import {InlineNotice} from '../../components/common/InlineNotice.jsx';
import {LoadingContent} from '../../components/common/LoadingContent.jsx';
import {PodShiftApi} from '../../api/PodShiftApi.js';
import {useAction} from '../../hooks/useAction.js';
import {useAutoRefresh} from '../../hooks/AutoRefreshContext.js';
import {useCopiedFlag} from '../../hooks/useCopiedFlag.js';
import {useCapability} from '../../hooks/CapabilitiesContext.js';
import {useRefreshToken} from '../../hooks/RefreshContext.js';

import '@patternfly/react-styles/css/components/Table/table.css';
import '../../components/modals/ServiceLogModal.scss';
import './dropQuadlet.scss';

/** @typedef {import('../../types/drop.js').DropHistoryItem} DropHistoryItem */
/** @typedef {import('../../types/drop.js').DropHistoryResult} DropHistoryResult */
/** @typedef {import('../../types/drop.js').DropResult} DropResult */
/** @typedef {import('../../types/drop.js').InstallLogResult} InstallLogResult */
/** @typedef {import('../../types/notice.js').NoticeVariant} NoticeVariant */

/**
 * @typedef {object} DropNotice
 * @property {NoticeVariant} variant Alert variant.
 * @property {string|Error} title Alert text, or an Error to show as text.
 * @property {boolean} [busy] True while the upload runs; a spinner is shown.
 */

/** How long a successful upload notice stays if the drop has not yet appeared in the history, in ms. */
const SUCCESS_NOTICE_MS = 10000;

/** Longest time the drop zone stays locked after a drop, unless the upload is still running, in ms. */
const DROP_LOCK_MS = 5000;

/**
 * Returns the milliseconds since a time, for the poll schedules.
 *
 * @param {number|null} time Time in ms since the epoch, or 0 or null for none.
 * @returns {number} The ms since then, or NaN when there is no time.
 */
function msSince(time) {
    return time ? Date.now() - time : NaN;
}

/**
 * Returns the label of a history status.
 *
 * @param {string} status Status from quadlet-drop-history.
 * @returns {string} The translated label.
 */
function statusLabel(status) {
    switch (status) {
    case 'accepted': return i18n("Accepted");
    case 'validated': return i18n("Validated");
    case 'installing': return i18n("Installing");
    case 'installed': return i18n("Installed");
    case 'unchanged': return i18n("Already installed with the same content, not installed again");
    case 'refused': return i18n("Refused");
    default: return i18n("Failed");
    }
}

/**
 * Shows the coloured status icon of a history row, with the status as tooltip and accessible name.
 *
 * @param {object} props Component props.
 * @param {string} props.status Status from quadlet-drop-history.
 * @returns {React.ReactElement} The icon.
 */
function DropStatusIcon({status}) {
    const label = statusLabel(status);
    let icon;
    switch (DropStatus.kind(status)) {
    case 'progress':
        icon = <Icon status="info"><InProgressIcon/></Icon>;
        break;
    case 'installed':
        icon = <Icon status="success"><CheckCircleIcon/></Icon>;
        break;
    case 'unchanged':
        icon = <Icon status="warning"><AttentionBellIcon/></Icon>;
        break;
    case 'refused':
        icon = <Icon status="warning"><BanIcon/></Icon>;
        break;
    default:
        icon = <Icon status="danger"><ExclamationCircleIcon/></Icon>;
    }
    return (
        <Tooltip content={label}>
            <span role="img" aria-label={label}>{icon}</span>
        </Tooltip>
    );
}

/**
 * Explains why a file is refused before upload, by name and then by size.
 *
 * @param {string} name File name.
 * @param {number} size File size in bytes.
 * @returns {string|null} The message, or null when the file is accepted.
 */
function fileProblemText(name, size) {
    switch (DropFileRules.check(name)) {
    case null:
        break;
    case 'BAD_PATH':
        return cockpit.format(i18n("$0: the name must be a file name without folders."), name);
    case 'HIDDEN':
        return cockpit.format(i18n("$0: hidden files are not accepted."), name);
    case 'BAD_EXTENSION':
        return cockpit.format(i18n("$0: only $1 files are accepted."), name, DropFileRules.EXTENSIONS.join(', '));
    case 'BAD_NAME':
        return cockpit.format(i18n("$0: the name must start with a letter or a digit and use only letters, digits, _, . and -."), name);
    default:
        return i18n("The file has no name.");
    }
    switch (DropFileRules.checkSize(size)) {
    case 'EMPTY':
        return cockpit.format(i18n("$0 is empty."), name);
    case 'TOO_LARGE':
        return cockpit.format(i18n("$0 is larger than 50 KB."), name);
    default:
        return null;
    }
}

/**
 * Explains why PodShift refused an upload.
 *
 * @param {DropResult} result Refused quadlet-drop result.
 * @returns {string} The message.
 */
function dropErrorText(result) {
    const name = result.name;
    switch (result.error) {
    case 'INVALID_NAME':
        return cockpit.format(i18n("$0: PodShift does not accept this file name."), name);
    case 'UNSUPPORTED_TYPE':
        return cockpit.format(i18n("$0: only $1 files are accepted."), name, DropFileRules.EXTENSIONS.join(', '));
    case 'INVALID_CONTENT':
        return cockpit.format(i18n("$0 could not be sent to PodShift. Try again."), name);
    case 'EMPTY_FILE':
        return cockpit.format(i18n("$0 is empty."), name);
    case 'TOO_LARGE':
        return cockpit.format(i18n("$0 is larger than 50 KB."), name);
    case 'WRONG_OWNER':
        return cockpit.format(i18n("$0 was not saved: the upload was not owned by the podshift user."), name);
    case 'NAME_BUSY':
        return cockpit.format(i18n("A file named $0 is still waiting to be processed. Try again in a few seconds."), name);
    case 'DROP_UNAVAILABLE':
        return i18n("The PodShift drop folder is missing. Check the PodShift health.");
    default:
        return result.message || cockpit.format(i18n("$0 was not accepted."), name);
    }
}

/**
 * The inside of the drop zone. A click anywhere in it opens the browser file picker; the
 * Browse button opens it too, so a click on the button is not handled twice.
 *
 * @param {object} props Component props.
 * @param {boolean} props.busy True while the drop zone is locked (upload or short lock after a drop); clicks do nothing.
 * @returns {React.ReactElement} The drop zone content.
 */
function DropZoneMain({busy}) {
    const {open} = useContext(MultipleFileUploadContext);

    return (
        <MultipleFileUploadMain
            titleIcon={<ImportIcon/>}
            titleText={i18n("Drag and drop a Quadlet file here")}
            titleTextSeparator={i18n("or")}
            infoText={cockpit.format(i18n("One file of at most 50 KB: $0"), DropFileRules.EXTENSIONS.join(', '))}
            browseButtonText={i18n("Browse")}
            isUploadButtonHidden={busy}
            onClick={event => {
                if (busy) { return }
                if (event.target instanceof Element && event.target.closest('button')) { return }
                open();
            }}
        />
    );
}

/**
 * Shows the drop history table, or a warning when the journal cannot be read.
 *
 * @param {object} props Component props.
 * @param {import('../../types/api.js').ActionState<DropHistoryResult>} props.state Load state of quadlet-drop-history.
 * @returns {React.ReactElement} The card.
 */
function HistoryCard({state}) {
    const {data, error, loading} = state;
    const items = data?.readable && Array.isArray(data.items) ? data.items : [];
    let body;
    if (data && data.readable === false) {
        body = <InlineNotice variant="warning" title={i18n("The drop history cannot be read from the journal.")}>{data.reason}</InlineNotice>;
    } else {
        body = (
            <LoadingContent
                loading={loading}
                error={error}
                hasData={data != null}
                isEmpty={items.length === 0}
                emptyTitle={i18n("No files dropped yet")}
                spinnerSize="md"
            >
                <table className="pf-v6-c-table pf-m-grid-md pf-m-compact" aria-label={i18n("Drop History")}>
                    <thead className="pf-v6-c-table__thead">
                        <tr className="pf-v6-c-table__tr">
                            <th className="pf-v6-c-table__th pf-m-fit-content podshift-drop__status" scope="col"><span className="pf-v6-screen-reader">{i18n("Status")}</span></th>
                            <th className="pf-v6-c-table__th pf-m-fit-content podshift-drop__nowrap" scope="col">{i18n("Date and time")}</th>
                            <th className="pf-v6-c-table__th pf-m-width-30" scope="col">{i18n("Name")}</th>
                            <th className="pf-v6-c-table__th" scope="col">{i18n("Description")}</th>
                        </tr>
                    </thead>
                    <tbody className="pf-v6-c-table__tbody">
                        {items.map(row => (
                            <tr className="pf-v6-c-table__tr" key={row.id}>
                                <td className="pf-v6-c-table__td pf-m-fit-content podshift-drop__status" data-label={i18n("Status")}>
                                    <DropStatusIcon status={row.status}/>
                                </td>
                                <td className="pf-v6-c-table__td pf-m-fit-content podshift-drop__nowrap" data-label={i18n("Date and time")}><span className="podshift-drop__time">{formatDateTime(row.time)}</span></td>
                                <td className="pf-v6-c-table__td pf-m-width-30" data-label={i18n("Name")}><span className="podshift-drop__name">{row.name}</span></td>
                                <td className="pf-v6-c-table__td" data-label={i18n("Description")}>
                                    {row.description}
                                    {DropStatus.showsReason(row) && <span className="podshift-drop__reason">{row.reason}</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </LoadingContent>
        );
    }
    return (
        <Card id="podshift-drop-history">
            <CardHeader>
                <CardTitle>{i18n("Drop History")}</CardTitle>
            </CardHeader>
            <CardBody>{body}</CardBody>
        </Card>
    );
}

/**
 * Shows the install log lines like the service log view, or a warning when the journal cannot be read.
 * The kebab menu picks newest or oldest first (newest by default), kept in localStorage by LogOrder,
 * the first browser storage in the project. Newest first keeps the reader's scroll position when new
 * lines arrive at the top; there is no automatic scrolling.
 * Copy log in the same menu copies the shown lines as plain text, in the shown order, and the
 * header reads "Copied" for 2 seconds. It is disabled while there are no lines.
 *
 * @param {object} props Component props.
 * @param {import('../../types/api.js').ActionState<InstallLogResult>} props.state Load state of quadlet-install-log.
 * @returns {React.ReactElement} The card.
 */
function InstallLogCard({state}) {
    const {data, error, loading} = state;
    const entries = useMemo(() => (data?.readable && Array.isArray(data.entries) ? data.entries : []), [data]);
    const [order, setOrder] = useState(() => LogOrder.read(() => window.localStorage));
    const code = useMemo(() => JournalText.highlight(LogOrder.apply(entries, order)), [entries, order]);
    const text = useMemo(() => JournalText.toText(LogOrder.apply(entries, order)), [entries, order]);
    const {copied, copy} = useCopiedFlag();
    const bodyRef = useRef(/** @type {HTMLDivElement|null} */ (null));
    const height = useRef(0);
    useLayoutEffect(() => {
        const content = bodyRef.current?.querySelector('.pf-v6-c-code-block__content');
        if (!content) { return }
        // Newest first: lines added at the top would push the view down, so move it by the added height.
        if (order === 'newest' && content.scrollTop > 0) { content.scrollTop += content.scrollHeight - height.current }
        height.current = content.scrollHeight;
    }, [code, order]);
    /**
     * Shows and stores the chosen order.
     *
     * @param {import('../../utils/LogOrder.js').LogOrderValue} value The chosen order.
     */
    function choose(value) {
        setOrder(value);
        LogOrder.write(() => window.localStorage, value);
    }
    /** @type {(import('../../types/card.js').MenuItem|import('../../types/card.js').MenuDivider)[]} */
    const menu = [
        {key: 'newest', label: i18n("Newest first"), isSelected: order === 'newest', onClick: () => choose('newest')},
        {key: 'oldest', label: i18n("Oldest first"), isSelected: order === 'oldest', onClick: () => choose('oldest')},
        {key: 'copy-divider', divider: true},
        {key: 'copy', label: i18n("Copy log"), isDisabled: text === '', onClick: () => { copy(text).catch(() => {}) }}
    ];
    let body;
    if (data && data.readable === false) {
        body = <InlineNotice variant="warning" title={i18n("The install log cannot be read from the journal.")}>{data.reason}</InlineNotice>;
    } else {
        body = (
            <LoadingContent
                loading={loading}
                error={error}
                hasData={data != null}
                isEmpty={entries.length === 0}
                emptyTitle={i18n("No log entries")}
                spinnerSize="md"
            >
                <CodeBlock className="podshift-drop__log">
                    <CodeBlockCode>{code}</CodeBlockCode>
                </CodeBlock>
            </LoadingContent>
        );
    }
    return (
        <Card id="podshift-drop-log">
            <CardHeader actions={{actions: <CardActionsMenu items={menu}/>, hasNoOffset: false}}>
                <CardTitle>
                    {i18n("Install log")}
                    <span className="podshift-drop__copied" role="status">{copied ? i18n("Copied") : ''}</span>
                </CardTitle>
            </CardHeader>
            <CardBody><div ref={bodyRef}>{body}</div></CardBody>
        </Card>
    );
}

/**
 * Shows the drop-quadlet page: the drop zone, the drop history and the install log.
 * One checked file is read in the browser, sent as base64 to quadlet-drop, and then the
 * history and the log load again. Each card polls with its own DropStatus.pollDelay, the
 * faster of two schedules: monitoring, from when auto refresh was turned on or restarted (the
 * page opened or became active, or Refresh), and dropping, from the last drop. A drop on this
 * page, or a new history item the page did not upload (a drop in a terminal), starts the
 * dropping schedule and restarts the auto refresh countdown; the first history load is not a
 * drop. While an item is in progress, both cards poll at least every second and the countdown
 * waits; it starts again from a fresh 4 minutes once nothing is in progress. Polling stops
 * while the page is hidden, another tab is open (the page is unmounted) or the header auto
 * refresh is off, and loads again when it is shown or turned on. A load never overlaps another
 * one. An Uninstall from another tab shows up in the install log through the normal polling,
 * as this page is unmounted while the other tab is open.
 * The cards are hidden when PodShift does not offer their action. A successful upload notice
 * hides after 10 seconds, or sooner when that drop appears in the history. A failed upload
 * stays until the next upload.
 * After a drop the drop zone is locked, so a second drop does not follow too quickly: while the
 * upload runs, and after a successful upload until the drop appears in the history (when the
 * success notice hides), for at most DROP_LOCK_MS from the drop. A refused or failed upload
 * unlocks it at once. Drops and clicks while it is locked are ignored.
 *
 * @returns {React.ReactElement} The page content.
 */
export function DropQuadletPage() {
    const token = useRefreshToken();
    const autoRefresh = useAutoRefresh();
    const canHistory = useCapability('quadlet-drop-history');
    const canLog = useCapability('quadlet-install-log');
    const {start: startAuto, hold: holdAuto, startedAt: monitorAt} = autoRefresh;
    const [dropAt, setDropAt] = useState(0);
    const [inProgress, setInProgress] = useState(false);
    const seenIds = useRef(/** @type {Set<string>|null} */ (null));
    const ownNames = useRef(/** @type {Set<string>} */ (new Set()));
    const [busy, setBusy] = useState(false);
    const [locked, setLocked] = useState(false);
    const lockTimer = useRef(/** @type {number|null} */ (null));
    const [notice, setNotice] = useState(/** @type {DropNotice|null} */ (null));
    const hideTimer = useRef(/** @type {number|null} */ (null));
    const pendingName = useRef(/** @type {string|null} */ (null));
    const knownIds = useRef(/** @type {Set<string>} */ (new Set()));
    const historyItems = useRef(/** @type {DropHistoryItem[]|undefined} */ (undefined));
    const historyPoll = useCallback(function historyPoll() {
        return DropStatus.pollDelay('history', msSince(monitorAt), msSince(dropAt), inProgress);
    }, [monitorAt, dropAt, inProgress]);
    const logPoll = useCallback(function logPoll() {
        return DropStatus.pollDelay('log', msSince(monitorAt), msSince(dropAt), inProgress);
    }, [monitorAt, dropAt, inProgress]);
    const startDropping = useCallback(function startDropping() {
        setDropAt(Date.now());
        startAuto();
    }, [startAuto]);
    const history = useAction('quadlet-drop-history', {enabled: canHistory, poll: historyPoll});
    const log = useAction('quadlet-install-log', {enabled: canLog, poll: logPoll});
    const clearHideTimer = useCallback(function clearHideTimer() {
        if (hideTimer.current !== null) {
            window.clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
    }, []);
    const unlock = useCallback(function unlock() {
        if (lockTimer.current !== null) {
            window.clearTimeout(lockTimer.current);
            lockTimer.current = null;
        }
        setLocked(false);
    }, []);
    const hideSuccessNotice = useCallback(function hideSuccessNotice() {
        clearHideTimer();
        unlock();
        pendingName.current = null;
        setNotice(current => (current?.variant === 'success' ? null : current));
    }, [clearHideTimer, unlock]);

    historyItems.current = history.data?.items;

    useEffect(function followProgress() {
        setInProgress(DropStatus.needsPoll(history.data?.items));
    }, [history.data]);

    useEffect(function holdCountdownWhileInProgress() {
        holdAuto(inProgress);
    }, [inProgress, holdAuto]);

    useEffect(function releaseHoldOnUnmount() {
        return function onUnmount() {
            holdAuto(false);
        };
    }, [holdAuto]);

    useEffect(function spotTerminalDrop() {
        const items = history.data?.items;
        if (!Array.isArray(items)) { return }
        const seen = seenIds.current;
        seenIds.current = new Set(items.map(item => item.id));
        if (seen === null) { return }
        const terminal = DropStatus.hasTerminalDrop(items, seen, ownNames.current);
        for (const item of items) {
            if (!seen.has(item.id)) { ownNames.current.delete(item.name) }
        }
        if (terminal) { startDropping() }
    }, [history.data, startDropping]);

    useEffect(function clearHideTimerOnUnmount() {
        return function onUnmount() {
            clearHideTimer();
            if (lockTimer.current !== null) { window.clearTimeout(lockTimer.current) }
        };
    }, [clearHideTimer]);

    useEffect(function hideSuccessWhenHistoryShowsDrop() {
        const name = pendingName.current;
        if (!name) { return }
        if (DropStatus.hasNewDrop(history.data?.items, name, knownIds.current)) {
            hideSuccessNotice();
        }
    }, [history.data, hideSuccessNotice]);

    useEffect(() => {
        clearHideTimer();
        pendingName.current = null;
        setNotice(current => (current?.busy ? current : null));
    }, [token, clearHideTimer]);

    /**
     * Locks the drop zone after a drop, for at most DROP_LOCK_MS; unlock() ends it sooner.
     */
    function lock() {
        if (lockTimer.current !== null) { window.clearTimeout(lockTimer.current) }
        setLocked(true);
        lockTimer.current = window.setTimeout(unlock, DROP_LOCK_MS);
    }

    /**
     * Reads, encodes and uploads one checked file, then loads the history and the log again.
     *
     * @param {File} file The file.
     */
    async function upload(file) {
        const name = file.name;
        setBusy(true);
        clearHideTimer();
        pendingName.current = null;
        setNotice({variant: 'info', title: cockpit.format(i18n("Uploading $0…"), name), busy: true});
        try {
            const content = DropFileRules.toBase64(new Uint8Array(await file.arrayBuffer()));
            const result = await PodShiftApi.callAction('quadlet-drop', {name, content});
            if (result.ok) {
                const uploaded = result.name || name;
                setNotice({variant: 'success', title: cockpit.format(i18n("$0 was uploaded. PodShift verifies and processes the file within seconds."), uploaded)});
                pendingName.current = uploaded;
                knownIds.current = new Set((historyItems.current || []).map(item => item.id));
                clearHideTimer();
                hideTimer.current = window.setTimeout(hideSuccessNotice, SUCCESS_NOTICE_MS);
                ownNames.current.add(uploaded);
            } else {
                setNotice({variant: 'danger', title: dropErrorText(result)});
                ownNames.current.delete(name);
                unlock();
            }
        } catch (e) {
            setNotice({variant: 'danger', title: e instanceof Error ? e : String(e)});
            ownNames.current.delete(name);
            unlock();
        } finally {
            setBusy(false);
            history.refresh().catch(() => {});
            log.refresh().catch(() => {});
        }
    }

    /**
     * Handles the files the drop zone accepted: exactly one, with an accepted name and size.
     * A file that is uploaded starts the dropping schedule and restarts the auto refresh countdown.
     *
     * @param {File[]} files Accepted files.
     */
    function onFiles(files) {
        if (busy || locked) { return }
        clearHideTimer();
        pendingName.current = null;
        if (files.length !== 1) {
            setNotice({variant: 'danger', title: i18n("Drop only one file at a time.")});
            return;
        }
        const problem = fileProblemText(files[0].name, files[0].size);
        if (problem) {
            setNotice({variant: 'danger', title: problem});
            return;
        }
        lock();
        ownNames.current.add(files[0].name);
        startDropping();
        upload(files[0]).catch(() => {});
    }

    /**
     * Handles the files the drop zone refused: more than one file, or a type it does not accept.
     *
     * @param {{file: File, errors: {code: string}[]}[]} rejections Refused files with their errors.
     */
    function onRejected(rejections) {
        if (busy || locked) { return }
        clearHideTimer();
        pendingName.current = null;
        const tooMany = rejections.length > 1 || rejections.some(item => item.errors.some(error => error.code === 'too-many-files'));
        if (tooMany) {
            setNotice({variant: 'danger', title: i18n("Drop only one file at a time.")});
            return;
        }
        const file = rejections[0]?.file;
        const name = file?.name || '';
        setNotice({variant: 'danger', title: fileProblemText(name, file?.size || 0) || cockpit.format(i18n("$0 is not accepted."), name)});
    }

    return (
        <Stack hasGutter>
            <StackItem>
                <MultipleFileUpload
                    className={busy || locked ? 'podshift-drop__zone podshift-drop__zone--locked' : 'podshift-drop__zone'}
                    onFileDrop={(_event, files) => onFiles(files)}
                    dropzoneProps={{
                        multiple: false,
                        maxFiles: 1,
                        disabled: busy || locked,
                        accept: DropFileRules.ACCEPT,
                        onDropRejected: rejections => onRejected(rejections)
                    }}
                >
                    <DropZoneMain busy={busy || locked}/>
                </MultipleFileUpload>
            </StackItem>
            {notice && (
                <StackItem>
                    <InlineNotice variant={notice.variant} title={notice.title}>
                        {notice.busy && <Spinner size="md" isInline aria-label={i18n("Uploading")}/>}
                    </InlineNotice>
                </StackItem>
            )}
            {canHistory && (
                <StackItem>
                    <HistoryCard state={history}/>
                </StackItem>
            )}
            {canLog && (
                <StackItem>
                    <InstallLogCard state={log}/>
                </StackItem>
            )}
        </Stack>
    );
}
