/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Body of the Inspect and Variables views when there is no code to show: the resource is gone,
 * or its inspect output is too large for the response.
 *
 * @file InspectNotice.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {AlertActionLink} from '@patternfly/react-core/dist/esm/components/Alert';
import {ClipboardCopyButton} from '@patternfly/react-core/dist/esm/components/ClipboardCopy';
import {CodeBlock, CodeBlockAction, CodeBlockCode} from '@patternfly/react-core/dist/esm/components/CodeBlock';
import {Stack, StackItem} from '@patternfly/react-core/dist/esm/layouts/Stack';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {useCopiedFlag} from '../../hooks/useCopiedFlag.js';

import {InlineNotice} from '../common/InlineNotice.jsx';

/** @typedef {import('../../types/inspect.js').InspectKind} InspectKind */

/**
 * Shows the terminal command that prints the inspect output, with a copy button.
 *
 * @param {object} props Component props.
 * @param {string} props.command The command.
 * @returns {React.ReactElement} The code block.
 */
function CommandBlock({command}) {
    const {copied, copy, reset} = useCopiedFlag();
    const actions = (
        <CodeBlockAction>
            <ClipboardCopyButton
                id="podshift-inspect-command-copy"
                aria-label={i18n("Copy command")}
                variant="plain"
                onClick={() => copy(command)}
                onTooltipHidden={() => reset()}
            >
                {copied ? i18n("Copied") : i18n("Copy command")}
            </ClipboardCopyButton>
        </CodeBlockAction>
    );
    return (
        <CodeBlock actions={actions} className="podshift-code-command">
            <CodeBlockCode>{command}</CodeBlockCode>
        </CodeBlock>
    );
}

/**
 * Shows why a view has no code: not found, with a Refresh link, or too large, with the size and
 * the Podman command to run in a terminal. Renders nothing when neither applies.
 *
 * @param {object} props Component props.
 * @param {InspectKind} props.kind Resource kind.
 * @param {string} props.resourceRef Name or ID passed to Podman.
 * @param {string} props.name Display name of the resource.
 * @param {boolean} [props.notFound] True when the resource no longer exists.
 * @param {number|null} [props.tooLargeSize] Byte size of an output too large to show, or null.
 * @param {() => void} [props.onRefresh] Called by Refresh, to close the view and reload the list.
 * @returns {React.ReactElement|null} The notice, or null.
 */
export function InspectNotice({kind, resourceRef, name, notFound = false, tooLargeSize = null, onRefresh}) {
    if (notFound) {
        return (
            <InlineNotice
                variant="warning"
                title={cockpit.format(i18n("This $0 no longer exists."), name)}
                actionLinks={onRefresh && (
                    <AlertActionLink onClick={onRefresh}>{i18n("Refresh")}</AlertActionLink>
                )}
            />
        );
    }
    if (tooLargeSize == null) { return null }
    return (
        <Stack hasGutter>
            <StackItem>
                <InlineNotice
                    variant="info"
                    title={cockpit.format(i18n("The inspect output is too large to show here ($0)."), cockpit.format_bytes(tooLargeSize))}
                />
            </StackItem>
            <StackItem>
                <CommandBlock command={`podman ${kind} inspect ${resourceRef}`}/>
            </StackItem>
        </Stack>
    );
}
