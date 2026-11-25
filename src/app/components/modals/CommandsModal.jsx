/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Modal showing terminal, log, process and system-info commands for one container,
 * laid out like a Markdown page, with Copy and Download of the same text as Markdown.
 *
 * @file CommandsModal.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useEffect, useMemo} from 'react';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';
import {Content} from '@patternfly/react-core/dist/esm/components/Content';
import {Modal, ModalBody, ModalFooter, ModalHeader} from '@patternfly/react-core/dist/esm/components/Modal';
import {Tooltip} from '@patternfly/react-core/dist/esm/components/Tooltip';
import {CheckIcon} from '@patternfly/react-icons/dist/esm/icons/check-icon';
import {CopyIcon} from '@patternfly/react-icons/dist/esm/icons/copy-icon';
import {DownloadIcon} from '@patternfly/react-icons/dist/esm/icons/download-icon';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {commandCatalogue, commandCatalogueMarkdown} from '../../utils/commandCatalogue.js';
import {ChannelDownload} from '../../utils/ChannelDownload.js';
import {commandsFileName, resourceDisplayName} from '../../utils/resourceName.js';
import {useCopiedFlag} from '../../hooks/useCopiedFlag.js';

import './CommandsModal.scss';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */
/** @typedef {import('../../types/container.js').CommandSectionId} CommandSectionId */
/** @typedef {import('../../types/container.js').ContainerCommandId} ContainerCommandId */
/** @typedef {import('../../types/resource.js').ResourceItem} ResourceItem */

/**
 * Returns the translated heading of a command section.
 *
 * @param {CommandSectionId} id Section identifier.
 * @returns {string} The translated heading.
 */
function sectionTitle(id) {
    switch (id) {
    case 'terminal':
        return i18n("Terminal");
    case 'logs':
        return i18n("Logs");
    case 'processes':
        return i18n("Processes");
    case 'system-info':
        return i18n("System info");
    default:
        return id;
    }
}

/**
 * Returns the translated one-line description of a command.
 *
 * @param {ContainerCommandId} id Command identifier.
 * @returns {string} The translated description.
 */
function commandDescription(id) {
    switch (id) {
    case 'exec-sh':
        return i18n("Open a root shell (container root maps to the podshift user on the host).");
    case 'exec-bash':
        return i18n("Open a root bash shell (works if the image has bash).");
    case 'logs-tail':
        return i18n("Show the last 100 log lines.");
    case 'logs-follow':
        return i18n("Follow the log output live.");
    case 'logs-since':
        return i18n("Show logs from the last 10 minutes.");
    case 'top':
        return i18n("List running processes in the container.");
    case 'stats':
        return i18n("Show one snapshot of CPU, memory and I/O usage.");
    case 'pstree':
        return i18n("Show the process tree (needs psmisc).");
    case 'ps-forest':
        return i18n("Show processes as a tree (needs procps).");
    case 'ps':
        return i18n("List processes (works in BusyBox images too).");
    case 'proc-loop':
        return i18n("List each process's name, PID and parent PID from /proc (works without ps).");
    case 'os-release':
        return i18n("Show the container OS name and version.");
    case 'meminfo':
        return i18n("Show memory figures visible inside the container.");
    case 'df':
        return i18n("Show filesystem disk space usage inside the container.");
    case 'id':
        return i18n("Show the user and group IDs inside the container.");
    case 'resolv':
        return i18n("Show DNS resolver settings inside the container.");
    case 'env':
        return i18n("Show environment variables in the container (can show secret values when run).");
    default:
        return id;
    }
}

/**
 * Renders a translated string that contains a literal code marker, with that marker as inline code.
 *
 * @param {string} text The translated text, already formatted with the marker.
 * @param {string} marker The literal marker to wrap, for example host.
 * @returns {React.ReactNode} The text with the marker in a code element, or the plain text if it is absent.
 */
function textWithInlineCode(text, marker) {
    const at = text.indexOf(marker);
    if (at < 0) { return text }
    return (
        <>
            {text.slice(0, at)}
            <code>{marker}</code>
            {text.slice(at + marker.length)}
        </>
    );
}

/**
 * One command snippet: a padded code well with the copy icon at the far right.
 * The whole control is a button, so a click or the keyboard copies the command.
 *
 * @param {object} props Component props.
 * @param {string} props.command The command to show and copy.
 * @returns {React.ReactElement} The snippet.
 */
function CommandSnippet({command}) {
    const {copied, copy} = useCopiedFlag();

    return (
        <Tooltip content={copied ? i18n("Copied") : i18n("Copy")}>
            <Button
                variant="plain"
                isBlock
                iconPosition="end"
                icon={copied ? <CheckIcon/> : <CopyIcon/>}
                className="podshift-commands-snippet"
                aria-label={copied ? i18n("Copied") : i18n("Copy command")}
                onClick={() => { copy(command).catch(() => {}) }}
            >
                {command}
            </Button>
        </Tooltip>
    );
}

/**
 * Shows ready-to-copy terminal commands for one container, grouped into sections like a
 * Markdown page. Host commands carry an inline "(host)" marker and appear first in each section.
 * Copy copies the same page as Markdown; Download saves it as commands-<name>.md.
 *
 * @param {object} props Component props.
 * @param {ResourceItem|null} props.container The container, or null when the modal is closed.
 * @param {AccessMode} props.mode Access mode of the user; admin mode prefixes host commands with sudo -u podshift -i.
 * @param {() => void} props.onClose Called when the modal is closed.
 * @returns {React.ReactElement|null} The modal, or null when no container is selected.
 */
export function CommandsModal({container, mode, onClose}) {
    const name = container ? resourceDisplayName(container) : '';
    const sections = useMemo(() => (name ? commandCatalogue(name, mode) : []), [name, mode]);
    const markdown = useMemo(() => (name ? commandCatalogueMarkdown(name, mode) : ''), [name, mode]);
    const {copied, copy, reset} = useCopiedFlag();

    useEffect(() => reset(), [name, markdown, reset]);

    if (!container) { return null }

    return (
        <Modal
            variant="large"
            isOpen
            onClose={onClose}
            aria-labelledby="podshift-commands-title"
        >
            <ModalHeader
                labelId="podshift-commands-title"
                title={i18n("Commands")}
            />
            <ModalBody>
                <Content className="podshift-commands-page">
                    <Content component="h1">
                        <span className="podshift-commands-mark"># </span>
                        {i18n("Commands for container:")}
                        {' '}
                        <code>{name}</code>
                    </Content>
                    <Content component="blockquote">
                        {i18n("Commands inside the container depend on its installed tools and current state, so some may not work in minimal or stopped containers.")}
                        {' '}
                        {textWithInlineCode(cockpit.format(i18n("Commands marked $0 work without tools in the image."), 'host'), 'host')}
                    </Content>
                    {sections.map(section => (
                        <React.Fragment key={section.id}>
                            <Content component="h2">
                                <span className="podshift-commands-mark">## </span>
                                {sectionTitle(section.id)}
                            </Content>
                            {section.commands.map(entry => (
                                <div key={entry.id} className="podshift-commands-entry">
                                    <Content component="p">
                                        {commandDescription(entry.id)}
                                        {entry.host && (
                                            <>
                                                {' '}
                                                <code>(host)</code>
                                            </>
                                        )}
                                    </Content>
                                    <CommandSnippet command={entry.command}/>
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </Content>
            </ModalBody>
            <ModalFooter>
                <Button variant="secondary" icon={<CopyIcon/>} isDisabled={!markdown} onClick={() => { copy(markdown).catch(() => {}) }}>
                    {copied ? i18n("Copied") : i18n("Copy")}
                </Button>
                <Button
                    variant="secondary"
                    icon={<DownloadIcon/>}
                    isDisabled={!markdown}
                    onClick={() => { ChannelDownload.downloadText(markdown, commandsFileName(name), 'text/markdown').catch(() => {}) }}
                >
                    {i18n("Download")}
                </Button>
                <Button variant="link" onClick={onClose}>
                    {i18n("Close")}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
