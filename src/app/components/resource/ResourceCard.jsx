/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * A resource card: icon and name, real id as a subtitle, running, status and source labels, rows and row groups.
 *
 * @file ResourceCard.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {Card, CardBody, CardHeader, CardTitle} from '@patternfly/react-core/dist/esm/components/Card';
import {Label, LabelGroup} from '@patternfly/react-core/dist/esm/components/Label';
import {Tooltip} from '@patternfly/react-core/dist/esm/components/Tooltip';
import {Title} from '@patternfly/react-core/dist/esm/components/Title';
import {Flex, FlexItem} from '@patternfly/react-core/dist/esm/layouts/Flex';
import {Stack, StackItem} from '@patternfly/react-core/dist/esm/layouts/Stack';
import {RunningIcon} from '@patternfly/react-icons/dist/esm/icons/running-icon';
import {AutomationIcon} from '@patternfly/react-icons/dist/esm/icons/automation-icon';

import {i18n} from '../../utils/i18n.js';

import {CardActionsMenu} from './CardActionsMenu.jsx';
import {ResourceSource} from '../../utils/ResourceSource.js';
import {resourceToText} from '../../utils/resourceToText.js';
import {copyText} from '../../utils/rowsToText.js';

import '@patternfly/react-styles/css/components/Table/table.css';
import './ResourceCard.scss';

/** @typedef {import('../../types/card.js').PropertyRow} PropertyRow */
/** @typedef {import('../../types/card.js').PropertyGroup} PropertyGroup */
/** @typedef {import('../../types/card.js').MenuItem} MenuItem */
/** @typedef {import('../../types/card.js').MenuDivider} MenuDivider */
/** @typedef {import('../../types/card.js').CardTone} CardTone */
/** @typedef {import('../../types/card.js').CardStatusVariant} CardStatusVariant */

/**
 * Card classes for each tone. The tone modifiers change the colour of the corner tint.
 *
 * @type {Record<CardTone, string>}
 */
const TONE_CLASSES = {
    neutral: 'podshift-resource-card',
    success: 'podshift-resource-card podshift-resource-card--success',
    danger: 'podshift-resource-card podshift-resource-card--danger',
};

const tableStyle = {
    tableLayout: 'fixed',
    width: '100%'
};

const labelCellStyle = {
    whiteSpace: 'normal',
    overflowWrap: 'anywhere'
};

const groupStackStyle = {
    rowGap: 'var(--pf-t--global--spacer--xl)'
};

/**
 * Shows label/value rows as a compact table; a missing value shows "Not set".
 * Rows with mono set show their value in a monospace font.
 *
 * @param {object} props Component props.
 * @param {PropertyRow[]} [props.rows] Rows to show.
 * @returns {React.ReactElement|null} The table, or null when there are no rows.
 */
function PropertiesTable({rows}) {
    if (!rows || rows.length === 0) { return null }
    return (
        <table className="pf-v6-c-table pf-m-grid-md pf-m-compact" style={tableStyle}>
            <colgroup>
                <col style={{width: '10rem'}}/>
                <col/>
            </colgroup>
            <tbody className="pf-v6-c-table__tbody">
                {rows.map(row => (
                    <tr className="pf-v6-c-table__tr" key={row.id || row.label}>
                        <th className="pf-v6-c-table__th" scope="row" style={labelCellStyle}>{row.label}</th>
                        <td className={row.mono ? 'pf-v6-c-table__td podshift-resource-card__mono' : 'pf-v6-c-table__td'}>{row.value == null ? i18n("Not set") : row.value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

/**
 * Shows a resource card: icon and name, real id as a subtitle, optional running and status labels, rows and subgroups.
 *
 * @param {object} props Component props.
 * @param {string} [props.id] DOM id of the card.
 * @param {string} props.title Display name.
 * @param {string} [props.subtitle] Real name shown under the title.
 * @param {string} [props.description] Optional description shown as a muted line under the title, before the subtitle.
 * @param {React.ReactNode} [props.icon] PatternFly icon element shown before the title.
 * @param {boolean} [props.running] When true, a green icon-only Running label is shown before the status.
 * @param {string} [props.autoUpdate] Translated auto-update tooltip; when set, an icon-only auto-update label is shown last.
 * @param {boolean} [props.autoUpdateWarning] When true, the auto-update label is shown as a warning.
 * @param {string} [props.status] Translated status text.
 * @param {CardStatusVariant} [props.statusVariant] PatternFly Label status for the status text.
 * @param {string} [props.source] Source key, for example 'quadlet'.
 * @param {PropertyRow[]} [props.rows] Main rows.
 * @param {PropertyGroup[]} [props.groups] Row groups below the main rows; empty groups are hidden.
 * @param {CardTone} [props.tone] Status tone, the colour of the corner tint: neutral (default), success or danger.
 * @param {(MenuItem|MenuDivider)[]} [props.actions] Extra kebab menu items and dividers after Copy.
 * @returns {React.ReactElement} The card.
 */
export function ResourceCard({
    id, title, subtitle, description, icon, running = false, autoUpdate, autoUpdateWarning = false, status, statusVariant, source, rows, groups = [], actions = [],
    tone = 'neutral'
}) {
    const mainRows = rows || [];
    const sourceInfo = ResourceSource.resourceSource(source);
    const sourceText = ResourceSource.sourceTooltip(sourceInfo, ResourceSource.sourceUnitFromGroups(groups));
    const visibleGroups = (groups || []).filter(group => group.rows?.length > 0);
    const canCopy = Boolean(title) || mainRows.length > 0 || visibleGroups.length > 0;

    const menuItems = [
        {
            key: 'copy',
            label: i18n("Copy"),
            isDisabled: !canCopy,
            onClick: () => copyText(resourceToText({
                title,
                description,
                subtitle,
                status,
                source: sourceInfo ? sourceInfo.label : null,
                rows: mainRows,
                groups: visibleGroups
            }))
        },
        ...actions
    ];

    return (
        <Card id={id} className={TONE_CLASSES[tone] || TONE_CLASSES.neutral}>
            <CardHeader className="podshift-resource-card__header" actions={{actions: <CardActionsMenu items={menuItems}/>, hasNoOffset: true}}>
                <CardTitle>
                    <Flex
                        alignItems={{default: 'alignItemsFlexStart'}}
                        flexWrap={{default: 'nowrap'}}
                        spaceItems={{default: 'spaceItemsMd'}}
                        className="podshift-resource-card__heading"
                    >
                        {icon && <FlexItem className="podshift-resource-card__icon">{icon}</FlexItem>}
                        <FlexItem className="podshift-resource-card__name-text">
                            <div>{title}</div>
                            {description && (
                                <div className="podshift-resource-card__subtitle">{description}</div>
                            )}
                            {subtitle && (
                                <div className="podshift-resource-card__subtitle">{subtitle}</div>
                            )}
                            {(running || autoUpdate || status || sourceInfo) && (
                                <LabelGroup className="podshift-resource-card__labels" numLabels={4}>
                                    {running && (
                                        <Tooltip content={i18n("Running")}>
                                            <Label className="podshift-resource-card__icon-only podshift-resource-card__running" icon={<RunningIcon/>} aria-label={i18n("Running")}/>
                                        </Tooltip>
                                    )}
                                    {status && <Label status={statusVariant}>{status}</Label>}
                                    {sourceInfo && (
                                        <Tooltip content={sourceText}>
                                            <Label color={sourceInfo.color} icon={<sourceInfo.Icon/>}>
                                                {sourceInfo.label}
                                            </Label>
                                        </Tooltip>
                                    )}
                                    {autoUpdate && (
                                        <Tooltip content={autoUpdate}>
                                            <Label
                                                className="podshift-resource-card__icon-only"
                                                status={autoUpdateWarning ? 'warning' : undefined}
                                                icon={<AutomationIcon/>}
                                                aria-label={autoUpdate}
                                            />
                                        </Tooltip>
                                    )}
                                </LabelGroup>
                            )}
                        </FlexItem>
                    </Flex>
                </CardTitle>
            </CardHeader>
            <CardBody>
                <Stack style={groupStackStyle}>
                    {mainRows.length > 0 && (
                        <StackItem>
                            <PropertiesTable rows={mainRows}/>
                        </StackItem>
                    )}
                    {visibleGroups.map(group => (
                        <StackItem key={group.id || group.label}>
                            <Title headingLevel="h4" size="md">{group.label}</Title>
                            <PropertiesTable rows={group.rows}/>
                        </StackItem>
                    ))}
                </Stack>
            </CardBody>
        </Card>
    );
}
