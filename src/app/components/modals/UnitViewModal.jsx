/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * The unit view: the Quadlet file of a systemd user service and the unit that Quadlet generated
 * from it, in one dialogue, from the quadlet-view and service-view actions.
 *
 * @file UnitViewModal.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useCallback, useMemo, useState} from 'react';
import {AlertActionLink} from '@patternfly/react-core/dist/esm/components/Alert';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';
import {DownloadIcon} from '@patternfly/react-icons/dist/esm/icons/download-icon';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {ChannelDownload} from '../../utils/ChannelDownload.js';
import {highlightIni} from '../../utils/highlightIni.js';
import {useActionResult} from '../../hooks/useActionResult.js';

import {CodeViewModal} from './CodeViewModal.jsx';
import {InlineNotice} from '../common/InlineNotice.jsx';
import {UnitViewHeader} from './UnitViewHeader.jsx';

import './UnitViewModal.scss';

/** @typedef {import('../../types/api.js').ActionResultState} ActionResultState */
/** @typedef {import('../../types/service.js').QuadletViewResult} QuadletViewResult */
/** @typedef {import('../../types/service.js').ServiceViewResult} ServiceViewResult */
/** @typedef {import('../../types/service.js').UnitView} UnitView */
/** @typedef {import('../../types/service.js').UnitViewKey} UnitViewKey */

/**
 * Which views of which unit view are shown and loaded. A view is loaded the first time it is
 * shown and kept while the dialogue is open.
 *
 * @typedef {object} UnitViewTabs
 * @property {UnitView|null} view The unit view the state belongs to.
 * @property {UnitViewKey} active The view that is shown.
 * @property {UnitViewKey[]} visited The views shown so far.
 */

/**
 * ID of the title element, for the modal's aria-labelledby.
 *
 * @type {string}
 */
const TITLE_ID = 'podshift-code-view-title';

/**
 * Translated notices for the quadlet-view file errors, by error code.
 *
 * @type {Record<string, function(string): string>}
 */
const QUADLET_ERRORS = {
    FILE_NOT_FOUND: path => cockpit.format(i18n("The Quadlet file $0 no longer exists."), path),
    OUTSIDE_QUADLET_DIR: path => cockpit.format(i18n("The Quadlet file $0 is not in the PodShift Quadlet folder, so it is not shown."), path),
    FILE_UNREADABLE: path => cockpit.format(i18n("The Quadlet file $0 cannot be read."), path),
};

/**
 * Returns the fresh state of a unit view: its first view shown, nothing else loaded.
 *
 * @param {UnitView|null} view The unit view, or null.
 * @returns {UnitViewTabs} The state.
 */
function freshTabs(view) {
    const active = view ? view.initial : 'unit';
    return {view, active, visited: view ? [active] : []};
}

/**
 * Returns the unit file path from the first line of `systemctl --user cat`, "# /path/unit.service".
 *
 * @param {string} text The text systemctl printed.
 * @returns {string} The path, or an empty string when the first line has none.
 */
function catPath(text) {
    const match = /^# (\/.+)$/.exec(text.split('\n', 1)[0]);
    return match ? match[1] : '';
}

/**
 * Checks that a path from the handler can be offered as a download: absolute, with no empty segment.
 *
 * @param {string} path The path.
 * @returns {boolean} True when the path is safe to pass to the download channel.
 */
function isFilePath(path) {
    const parts = path.slice(1).split('/');
    return path.startsWith('/') && parts.every(part => part !== '' && part !== '.' && part !== '..');
}

/**
 * Builds the warning shown when a unit is no longer loaded, with Refresh when it is given.
 *
 * @param {string} unit Unit name.
 * @param {(() => void)|undefined} onRefresh Called by Refresh.
 * @returns {React.ReactElement} The alert.
 */
function goneNotice(unit, onRefresh) {
    return (
        <InlineNotice
            variant="warning"
            title={cockpit.format(i18n("This $0 no longer exists."), unit)}
            actionLinks={onRefresh && (
                <AlertActionLink onClick={onRefresh}>{i18n("Refresh")}</AlertActionLink>
            )}
        />
    );
}

/**
 * Builds the notice shown instead of a text that is too large.
 *
 * @param {number|undefined} size Byte size of the text.
 * @returns {React.ReactElement} The alert.
 */
function tooLargeNotice(size) {
    return (
        <InlineNotice
            variant="info"
            title={cockpit.format(i18n("The output is too large to show here ($0)."), cockpit.format_bytes(Number(size) || 0))}
        />
    );
}

/**
 * Shows the Quadlet file and the generated unit of one service, both with INI colours. Show Unit
 * opens the Unit view and Show Quadlet the Quadlet view; with a Quadlet file the labels in the
 * title row switch between them, else only the Unit view exists. Each view is loaded the first
 * time it is shown and kept while the dialogue is open. The path line follows the view. A unit that
 * is gone, a plain unit, a Quadlet file that is missing, outside the PodShift Quadlet folder or
 * unreadable, or a text that is too large shows a notice instead. Copy and Download act on the view
 * that is shown. Download offers the file itself through ChannelDownload.downloadFile, as the
 * Inspect download does (no blob: URL, which Cockpit's Content Security Policy refuses): the
 * Quadlet file under its own name, or the unit file systemctl cat names first under the unit name.
 *
 * @param {object} props Component props.
 * @param {UnitView|null} props.view The open unit view, or null.
 * @param {() => void} props.onClose Called when the view is closed.
 * @param {() => void} [props.onRefresh] Called by Refresh in the not-found notice, to close the view and reload the list.
 * @returns {React.ReactElement|null} The modal, or null when no view is open.
 */
export function UnitViewModal({view, onClose, onRefresh}) {
    const [state, setState] = useState(/** @type {UnitViewTabs} */ (freshTabs(view)));
    let tabs = state;
    if (state.view !== view) {
        // A new unit view starts over; React allows this update during render.
        tabs = freshTabs(view);
        setState(tabs);
    }
    const hasQuadlet = Boolean(view?.hasQuadlet);
    const active = hasQuadlet ? tabs.active : 'unit';

    /** @type {ActionResultState<QuadletViewResult>} */
    const quadlet = useActionResult('quadlet-view', view && hasQuadlet && tabs.visited.includes('quadlet') ? {unit: view.unit} : null);
    /** @type {ActionResultState<ServiceViewResult>} */
    const unitFile = useActionResult('service-view', view && tabs.visited.includes('unit') ? {unit: view.unit, mode: 'unit'} : null);
    const quadletData = quadlet.data;
    const unitData = unitFile.data;

    let text = '';
    let path = '';
    let fileName = '';
    let notice = null;
    if (view && active === 'quadlet') {
        path = quadletData?.path || view.quadletPath || '';
        fileName = quadletData?.name || '';
        if (quadletData && !quadletData.found) { notice = goneNotice(view.unit, onRefresh) } else if (quadletData?.error === 'NOT_QUADLET') { notice = <InlineNotice variant="info" title={i18n("This unit was not generated from a Quadlet file.")}/> } else if (quadletData?.error) { notice = <InlineNotice variant="warning" title={(QUADLET_ERRORS[quadletData.error] || QUADLET_ERRORS.FILE_UNREADABLE)(path)}/> } else if (quadletData?.tooLarge) { notice = tooLargeNotice(quadletData.size) } else if (quadletData && typeof quadletData.text === 'string') { text = quadletData.text }
    } else if (view) {
        fileName = view.unit;
        if (unitData && !unitData.found) { notice = goneNotice(view.unit, onRefresh) } else if (unitData?.tooLarge) { notice = tooLargeNotice(unitData.size) } else if (unitData && typeof unitData.text === 'string') { text = unitData.text }
        path = catPath(text) || view.unitPath || '';
    }
    // Download reads the file itself as root, like Inspect: the Quadlet file, or the unit file systemctl cat names first.
    const filePath = text && isFilePath(path) ? path : '';
    const code = useMemo(() => highlightIni(text), [text]);

    const select = useCallback(
        /**
         * Shows a view, and loads it the first time.
         *
         * @param {UnitViewKey} key The view.
         */
        function selectView(key) {
            setState(current => ({
                ...current,
                active: key,
                visited: current.visited.includes(key) ? current.visited : [...current.visited, key],
            }));
        },
        []
    );

    if (!view) { return null }

    const result = active === 'quadlet' ? quadlet : unitFile;
    return (
        <CodeViewModal
            isOpen
            title={view.unit}
            header={(
                <UnitViewHeader
                    titleId={TITLE_ID}
                    name={view.unit}
                    path={path}
                    active={active}
                    hasQuadlet={hasQuadlet}
                    onSelect={select}
                />
            )}
            text={text}
            code={code}
            loading={result.loading}
            error={result.error}
            notice={notice}
            endActions={(
                <Button
                    variant="secondary"
                    icon={<DownloadIcon/>}
                    isDisabled={!filePath || !fileName}
                    onClick={() => ChannelDownload.downloadFile(filePath, fileName, 'text/plain')}
                >
                    {i18n("Download")}
                </Button>
            )}
            onClose={onClose}
        />
    );
}
