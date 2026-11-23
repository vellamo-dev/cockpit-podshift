/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Health page: the full health check report, grouped.
 *
 * @file HealthPage.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {Card, CardBody, CardHeader, CardTitle} from '@patternfly/react-core/dist/esm/components/Card';
import {HelperText, HelperTextItem} from '@patternfly/react-core/dist/esm/components/HelperText';
import {Title} from '@patternfly/react-core/dist/esm/components/Title';
import {Flex, FlexItem} from '@patternfly/react-core/dist/esm/layouts/Flex';
import {Stack, StackItem} from '@patternfly/react-core/dist/esm/layouts/Stack';

import {i18n} from '../../utils/i18n.js';

import {CardActionsMenu} from '../../components/resource/CardActionsMenu.jsx';
import {HealthStatusIcon} from '../../components/common/HealthStatusIcon.jsx';
import {InlineNotice} from '../../components/common/InlineNotice.jsx';
import {LoadingContent} from '../../components/common/LoadingContent.jsx';
import {useHealthCheck} from '../../hooks/HealthContext.js';
import {healthToText} from '../../utils/healthToText.js';
import {copyText} from '../../utils/rowsToText.js';

import '@patternfly/react-styles/css/components/Table/table.css';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */
/** @typedef {import('../../types/health.js').HealthCheckState} HealthCheckState */

const groupTableStyle = {
    tableLayout: 'fixed',
    width: '100%'
};

const groupStackStyle = {
    rowGap: 'var(--pf-t--global--spacer--xl)'
};

/**
 * Shows the full health check report: the summary in the title, then each group of checks. Needs admin access.
 * Each time the tab opens it runs a new check; the last result stays on screen while it runs.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @returns {React.ReactElement} The page content.
 */
export function HealthPage({mode}) {
    const admin = mode === 'admin';
    /** @type {HealthCheckState} */
    const {data, loading, error} = useHealthCheck(admin, {fresh: true});
    const title = i18n("Health");
    const unavailable = admin ? null : i18n("Requires administrative access");
    const summary = data?.summary;
    const canCopy = !unavailable && data != null && summary != null;

    let heading = title;
    if (!unavailable && summary) {
        heading = (
            <Flex spaceItems={{default: 'spaceItemsSm'}} alignItems={{default: 'alignItemsCenter'}} flexWrap={{default: 'nowrap'}}>
                <FlexItem><HealthStatusIcon state={summary.state}/></FlexItem>
                <FlexItem>{summary.label}</FlexItem>
            </Flex>
        );
    }

    const menuItems = [
        {
            key: 'copy',
            label: i18n("Copy"),
            isDisabled: !canCopy,
            onClick: () => copyText(healthToText(title, data))
        }
    ];

    return (
        <Card id="podshift-health-report">
            <CardHeader actions={{actions: <CardActionsMenu items={menuItems}/>, hasNoOffset: false}}>
                <CardTitle>{heading}</CardTitle>
            </CardHeader>
            <CardBody>
                <LoadingContent
                    unavailable={unavailable}
                    loading={loading}
                    error={error}
                    hasData={data != null}
                    spinnerSize="md"
                    warningPlacement="none"
                >
                    <Stack style={groupStackStyle}>
                        {error && (
                            <StackItem>
                                <InlineNotice variant="warning" title={error}/>
                            </StackItem>
                        )}
                        {(data?.groups ? data.groups : []).map(group => (
                            <StackItem key={group.id}>
                                <Title headingLevel="h4" size="md">{group.label}</Title>
                                <table className="pf-v6-c-table pf-m-grid-md pf-m-compact" style={groupTableStyle}>
                                    <colgroup>
                                        <col style={{width: '18rem'}}/>
                                        <col/>
                                    </colgroup>
                                    <tbody className="pf-v6-c-table__tbody">
                                        {(group.rows || []).map(row => (
                                            <tr className="pf-v6-c-table__tr" key={row.id}>
                                                <th className="pf-v6-c-table__th" scope="row">
                                                    <Flex spaceItems={{default: 'spaceItemsSm'}} alignItems={{default: 'alignItemsCenter'}} flexWrap={{default: 'nowrap'}}>
                                                        <FlexItem><HealthStatusIcon state={row.state}/></FlexItem>
                                                        <FlexItem>{row.label}</FlexItem>
                                                    </Flex>
                                                </th>
                                                <td className="pf-v6-c-table__td">
                                                    {row.value}
                                                    {row.fix && (
                                                        <HelperText>
                                                            <HelperTextItem>{row.fix}</HelperTextItem>
                                                        </HelperText>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </StackItem>
                        ))}
                    </Stack>
                </LoadingContent>
            </CardBody>
        </Card>
    );
}
