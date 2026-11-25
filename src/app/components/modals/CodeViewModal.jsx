/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * A large modal that shows coloured code in a scrollable CodeBlock, with Copy and Close.
 * Base of InspectModal, VariablesModal, ServiceStatusModal and UnitViewModal.
 *
 * @file CodeViewModal.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useEffect} from 'react';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';
import {CodeBlock, CodeBlockCode} from '@patternfly/react-core/dist/esm/components/CodeBlock';
import {Modal, ModalBody, ModalFooter, ModalHeader} from '@patternfly/react-core/dist/esm/components/Modal';
import {Spinner} from '@patternfly/react-core/dist/esm/components/Spinner';
import {Stack, StackItem} from '@patternfly/react-core/dist/esm/layouts/Stack';
import {CopyIcon} from '@patternfly/react-icons/dist/esm/icons/copy-icon';

import {i18n} from '../../utils/i18n.js';
import {useCopiedFlag} from '../../hooks/useCopiedFlag.js';

import {InlineNotice} from '../common/InlineNotice.jsx';

import './CodeViewModal.scss';

/**
 * Shows code in a large modal. Copy copies the text as shown and reads "Copied" for 2 seconds.
 * The body is, in this order: the error, a spinner while loading, the notice, or the code.
 *
 * @param {object} props Component props.
 * @param {boolean} [props.isOpen] True while the modal is shown.
 * @param {string} props.title Translated title.
 * @param {string} [props.description] Translated note under the title.
 * @param {React.ReactNode} [props.header] Header content instead of the title and the note; it must contain an element with the id podshift-code-view-title.
 * @param {string} props.text Plain text, used by Copy; empty while loading.
 * @param {React.ReactNode} props.code Coloured form of the text, for example from highlightJson.
 * @param {boolean} [props.loading] True while the data loads.
 * @param {Error|null} [props.error] Error of the load.
 * @param {React.ReactNode} [props.notice] Shown instead of the code, for example when the data is too large.
 * @param {React.ReactNode} [props.alert] Shown above the body, for example a failed download.
 * @param {React.ReactNode} [props.actions] Extra footer buttons, shown before Copy.
 * @param {React.ReactNode} [props.endActions] Extra footer buttons, shown after Copy and before Close.
 * @param {() => void} props.onClose Called when the modal is closed.
 * @returns {React.ReactElement} The modal.
 */
export function CodeViewModal({isOpen = true, title, description, header, text, code, loading = false, error = null, notice = null, alert = null, actions, endActions, onClose}) {
    const {copied, copy, reset} = useCopiedFlag();

    // A new text or a closed modal shows Copy again.
    useEffect(() => reset(), [isOpen, text, reset]);

    let body;
    if (error) { body = <InlineNotice variant="danger" title={error}/> } else if (loading) { body = <Spinner size="lg"/> } else if (notice) { body = notice } else {
        body = (
            <CodeBlock className="podshift-code-view">
                <CodeBlockCode>{code}</CodeBlockCode>
            </CodeBlock>
        );
    }

    return (
        <Modal
            variant="large"
            className="podshift-code-view-modal"
            isOpen={isOpen}
            onClose={onClose}
            aria-labelledby="podshift-code-view-title"
        >
            {header
                ? <ModalHeader>{header}</ModalHeader>
                : <ModalHeader labelId="podshift-code-view-title" title={title} description={description}/>}
            <ModalBody>
                {alert
                    ? (
                        <Stack hasGutter>
                            <StackItem>{alert}</StackItem>
                            <StackItem>{body}</StackItem>
                        </Stack>
                    )
                    : body}
            </ModalBody>
            <ModalFooter>
                {actions}
                <Button
                    variant="secondary"
                    icon={<CopyIcon/>}
                    isDisabled={!text}
                    onClick={() => copy(text)}
                >
                    {copied ? i18n("Copied") : i18n("Copy")}
                </Button>
                {endActions}
                <Button variant="link" onClick={onClose}>
                    {i18n("Close")}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
