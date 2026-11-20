/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * A card with a title and label/value rows, built like Cockpit's System information card.
 *
 * @file PropertiesCard.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';
import {Card, CardBody, CardHeader, CardTitle} from '@patternfly/react-core/dist/esm/components/Card';
import {Flex, FlexItem} from '@patternfly/react-core/dist/esm/layouts/Flex';
import {Tooltip} from '@patternfly/react-core/dist/esm/components/Tooltip';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {CockpitLinks} from '../../utils/CockpitLinks.js';

import {CardActionsMenu} from '../../components/resource/CardActionsMenu.jsx';
import {LoadingContent} from '../../components/common/LoadingContent.jsx';
import {copyText, rowsToText} from '../../utils/rowsToText.js';

// PatternFly table styles; plain table markup like Cockpit's System information card.
import '@patternfly/react-styles/css/components/Table/table.css';
// PatternFly alignment utility, for right-aligned values.
import '@patternfly/react-styles/css/utilities/Alignment/alignment.css';

/** @typedef {import('../../types/card.js').PropertyRow} PropertyRow */
/** @typedef {import('../../types/card.js').MenuItem} MenuItem */

/**
 * Label cell of a row: a Services tab link when the row has a user unit, a
 * Cockpit Services link when it has a system unit, a tab link when rowTab
 * returns a tab id, otherwise plain text. A unit link takes precedence if both apply.
 *
 * @param {PropertyRow} row The row.
 * @param {((row: PropertyRow) => (string|undefined))|undefined} rowTab Optional function that returns a tab id for the row.
 * @returns {React.ReactNode} The label content.
 */
function rowLabel(row, rowTab) {
    if (row.unit && row.scope === 'user') {
        return (
            <Tooltip content={i18n("Show in Services tab")}>
                <Button variant="link" isInline onClick={() => CockpitLinks.openServicesTab(row.unit)}>
                    {row.label}
                </Button>
            </Tooltip>
        );
    }
    if (row.unit) {
        return (
            <Tooltip content={i18n("Open in Services")}>
                <Button variant="link" isInline onClick={() => CockpitLinks.openService(row.unit)}>
                    {row.label}
                </Button>
            </Tooltip>
        );
    }
    const tab = rowTab ? rowTab(row) : undefined;
    if (tab) {
        return (
            <Button variant="link" isInline onClick={() => cockpit.location.go([tab])}>
                {row.label}
            </Button>
        );
    }
    return row.label;
}

/**
 * Value cell of a row: what rowValue returns for it, otherwise the plain value.
 *
 * @param {PropertyRow} row The row.
 * @param {((row: PropertyRow) => (React.ReactNode|undefined))|undefined} rowValue Optional function that returns the cell content.
 * @returns {React.ReactNode} The value content.
 */
function cellValue(row, rowValue) {
    const content = rowValue ? rowValue(row) : undefined;
    if (content === undefined) {
        return row.value;
    }
    return content;
}

/**
 * Shows a card with a title and label/value rows, or its loading, error or unavailable state.
 *
 * @param {object} props Component props.
 * @param {string} [props.id] DOM id of the card.
 * @param {React.ReactNode} [props.icon] PatternFly icon element shown before the title.
 * @param {string} props.title Card title.
 * @param {PropertyRow[]|null} [props.rows] Rows, or null when no data has loaded yet.
 * @param {'start'|'end'} [props.alignValues] 'end' puts the values on the right.
 * @param {boolean} [props.loading] True while the first load runs.
 * @param {Error|null} [props.error] Error of the last load; shown above the rows when old rows exist.
 * @param {string|null} [props.unavailable] Text shown instead of the rows, for example without admin access.
 * @param {MenuItem[]} [props.actions] Extra kebab menu items after Copy.
 * @param {((row: PropertyRow) => (string|undefined))|undefined} [props.rowTab] Returns a tab id to open when the label is clicked; unit links take precedence.
 * @param {((row: PropertyRow) => (React.ReactNode|undefined))|undefined} [props.rowValue] Returns the value cell content for a row, for example an edit button; undefined shows the plain value.
 * @returns {React.ReactElement} The card.
 */
export function PropertiesCard({
    id, icon, title, rows, alignValues = 'start',
    loading = false, error = null, unavailable = null,
    actions = [], rowTab, rowValue
}) {
    const canCopy = !unavailable && rows != null && rows.length > 0;
    const menuItems = [
        {
            key: 'copy',
            label: i18n("Copy"),
            isDisabled: !canCopy,
            onClick: () => copyText(rowsToText(title, rows))
        },
        ...actions
    ];

    const heading = icon
        ? (
            <Flex spaceItems={{default: 'spaceItemsMd'}} alignItems={{default: 'alignItemsCenter'}} flexWrap={{default: 'nowrap'}}>
                <FlexItem>{icon}</FlexItem>
                <FlexItem>{title}</FlexItem>
            </Flex>
        )
        : title;

    return (
        <Card id={id}>
            <CardHeader actions={{actions: <CardActionsMenu items={menuItems}/>, hasNoOffset: false}}>
                <CardTitle>{heading}</CardTitle>
            </CardHeader>
            <CardBody>
                <LoadingContent
                    unavailable={unavailable}
                    loading={loading}
                    error={error}
                    hasData={rows != null}
                    spinnerSize="md"
                >
                    <table className="pf-v6-c-table pf-m-grid-md pf-m-compact">
                        <tbody className="pf-v6-c-table__tbody">
                            {(rows || []).map(row => (
                                <tr className="pf-v6-c-table__tr" key={row.id || row.label}>
                                    <th className="pf-v6-c-table__th" scope="row">{rowLabel(row, rowTab)}</th>
                                    <td className={alignValues === 'end' ? 'pf-v6-c-table__td pf-v6-u-text-align-end' : 'pf-v6-c-table__td'}>{cellValue(row, rowValue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </LoadingContent>
            </CardBody>
        </Card>
    );
}
