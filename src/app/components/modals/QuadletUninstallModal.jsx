/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Confirm modal to uninstall one installed Quadlet file or app with the quadlet-remove action,
 * opened from the Uninstall item of a Quadlets, Containers, Volumes or Networks card.
 *
 * @file QuadletUninstallModal.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useState} from 'react';
import {Alert} from '@patternfly/react-core/dist/esm/components/Alert';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';
import {Checkbox} from '@patternfly/react-core/dist/esm/components/Checkbox';
import {Modal, ModalBody, ModalFooter, ModalHeader} from '@patternfly/react-core/dist/esm/components/Modal';
import {Stack, StackItem} from '@patternfly/react-core/dist/esm/layouts/Stack';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {QuadletUninstall} from '../../utils/QuadletUninstall.js';
import {PodShiftApi} from '../../api/PodShiftApi.js';

/** @typedef {import('../../types/drop.js').RemoveResult} RemoveResult */
/** @typedef {import('../../types/drop.js').UninstallTarget} UninstallTarget */

/**
 * Explains why PodShift refused an uninstall.
 *
 * @param {RemoveResult} result Refused quadlet-remove result.
 * @param {string} name The file or app name that was sent.
 * @returns {string} The message.
 */
function uninstallErrorText(result, name) {
    switch (result.error) {
    case 'INVALID_NAME':
        return cockpit.format(i18n("$0 cannot be uninstalled: PodShift does not accept this name."), name);
    case 'NOT_FOUND':
        return cockpit.format(i18n("$0 is not installed in the PodShift Quadlet folder, or not any more."), name);
    case 'IN_USE':
        return cockpit.format(i18n("$0 is still in use and cannot be uninstalled: $1."), name, result.message || i18n("used by another Quadlet"));
    case 'BUSY':
        return cockpit.format(i18n("An uninstall of $0 is already waiting."), name);
    case 'REMOVE_UNAVAILABLE':
        return i18n("The PodShift remove queue folder is missing. Check the PodShift health.");
    default:
        return result.message || cockpit.format(i18n("$0 could not be uninstalled."), name);
    }
}

/**
 * Returns the modal title: Uninstall <file> for a single file, Uninstall app <name> for an app.
 *
 * @param {UninstallTarget} target What Uninstall removes.
 * @returns {string} The translated title.
 */
export function uninstallTitle(target) {
    return target.isApp
        ? cockpit.format(i18n("Uninstall app $0"), target.name)
        : cockpit.format(i18n("Uninstall $0"), target.name);
}

/**
 * Asks before uninstalling one installed Quadlet file or app. The text names what is removed,
 * also when the modal was opened from a container, volume or network. Volumes are kept unless
 * Also delete volume data, shown for an app or a .volume file, is ticked; it is never ticked at
 * first. ok from PodShift means the removal is queued; the install log on the Drop Quadlet tab
 * shows its progress.
 *
 * @param {object} props Component props.
 * @param {UninstallTarget|null} props.target What to uninstall; nothing is shown when null.
 * @param {() => void} props.onClose Called when the modal is closed without a change.
 * @param {(target: UninstallTarget) => void} props.onQueued Called with the target after the removal was queued.
 * @returns {React.ReactElement|null} The modal, or null when there is no target.
 */
export function QuadletUninstallModal({target, onClose, onQueued}) {
    if (!target) { return null }
    return <UninstallConfirm key={`${target.name}:${target.file}`} target={target} onClose={onClose} onQueued={onQueued}/>;
}

/**
 * The open confirm modal of one target, so its state starts fresh for each target.
 *
 * @param {object} props Component props.
 * @param {UninstallTarget} props.target What to uninstall.
 * @param {() => void} props.onClose Called when the modal is closed without a change.
 * @param {(target: UninstallTarget) => void} props.onQueued Called with the target after the removal was queued.
 * @returns {React.ReactElement} The modal.
 */
function UninstallConfirm({target, onClose, onQueued}) {
    const [volumes, setVolumes] = useState(false);
    const [busy, setBusy] = useState(false);
    const [failure, setFailure] = useState(/** @type {string|null} */ (null));
    const offersVolumes = QuadletUninstall.offersVolumes(target);

    /**
     * Sends the removal and closes on success, or shows PodShift's refusal or the error.
     */
    async function uninstall() {
        setBusy(true);
        setFailure(null);
        try {
            const result = await PodShiftApi.callAction('quadlet-remove', {name: target.name, volumes: offersVolumes && volumes});
            if (result.ok) {
                onQueued(target);
                return;
            }
            setFailure(uninstallErrorText(result, target.name));
        } catch (e) {
            setFailure(e.message || String(e));
        }
        setBusy(false);
    }

    let what;
    if (target.isApp) {
        what = cockpit.format(i18n("All Quadlet files of app $0 are uninstalled: their units are stopped and the files are removed. Images are kept."), target.name);
    } else {
        what = cockpit.format(i18n("The units of $0 are stopped and the file is removed. Images are kept."), target.name);
    }

    return (
        <Modal
            variant="medium"
            isOpen
            onClose={busy ? undefined : onClose}
            aria-labelledby="podshift-quadlet-uninstall-title"
        >
            <ModalHeader labelId="podshift-quadlet-uninstall-title" title={uninstallTitle(target)} titleIconVariant="warning"/>
            <ModalBody>
                <Stack hasGutter>
                    {failure && (
                        <StackItem>
                            <Alert variant="danger" isInline title={failure}/>
                        </StackItem>
                    )}
                    {target.isApp && target.file !== target.name && (
                        <StackItem>
                            {cockpit.format(i18n("$0 is part of app $1, so the whole app is uninstalled."), target.file, target.name)}
                        </StackItem>
                    )}
                    <StackItem>{what}</StackItem>
                    {offersVolumes && (
                        <StackItem>
                            <Checkbox
                                id="podshift-quadlet-uninstall-volumes"
                                label={i18n("Also delete volume data")}
                                description={i18n("The volumes and all their data are deleted permanently. This cannot be undone.")}
                                isChecked={volumes}
                                isDisabled={busy}
                                onChange={(_event, checked) => setVolumes(checked)}
                            />
                        </StackItem>
                    )}
                    <StackItem>
                        {i18n("The install log on the Drop Quadlet tab shows the progress.")}
                    </StackItem>
                </Stack>
            </ModalBody>
            <ModalFooter>
                <Button variant="danger" isDisabled={busy} isLoading={busy} onClick={() => { uninstall().catch(() => {}) }}>
                    {i18n("Uninstall")}
                </Button>
                <Button variant="link" isDisabled={busy} onClick={onClose}>
                    {i18n("Cancel")}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
