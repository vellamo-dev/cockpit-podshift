/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Overview card with the health check summary and a link to the Health tab.
 *
 * @file HealthCard.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';
import {Card, CardBody, CardHeader, CardTitle} from '@patternfly/react-core/dist/esm/components/Card';
import {Flex, FlexItem} from '@patternfly/react-core/dist/esm/layouts/Flex';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {HeartbeatIcon} from '@patternfly/react-icons/dist/esm/icons/heartbeat-icon';

import {CardActionsMenu} from '../../components/resource/CardActionsMenu.jsx';
import {HealthStatusIcon} from '../../components/common/HealthStatusIcon.jsx';
import {LoadingContent} from '../../components/common/LoadingContent.jsx';
import {useHealthCheck} from '../../hooks/HealthContext.js';
import {healthToText} from '../../utils/healthToText.js';
import {copyText} from '../../utils/rowsToText.js';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */
/** @typedef {import('../../types/health.js').HealthCheckState} HealthCheckState */

/**
 * Shows the health check summary and a link to the Health tab. Needs admin access.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @returns {React.ReactElement} The card.
 */
export function HealthCard({mode}) {
    const admin = mode === 'admin';
    /** @type {HealthCheckState} */
    const {data, loading, error} = useHealthCheck(admin);
    const title = i18n("Health");
    const unavailable = admin ? null : i18n("Requires administrative access");
    const summary = data?.summary;
    const hasIssues = summary?.state === 'warn' || summary?.state === 'fail';
    const canCopy = !unavailable && data != null && summary != null;

    const menuItems = [
        {
            key: 'report',
            label: i18n("View report"),
            onClick: () => cockpit.location.go(['health'])
        },
        {
            key: 'copy',
            label: i18n("Copy"),
            isDisabled: !canCopy,
            onClick: () => copyText(healthToText(title, data))
        }
    ];

    return (
        <Card id="podshift-health">
            <CardHeader actions={{actions: <CardActionsMenu items={menuItems}/>, hasNoOffset: false}}>
                <CardTitle>
                    <Flex spaceItems={{default: 'spaceItemsMd'}} alignItems={{default: 'alignItemsCenter'}} flexWrap={{default: 'nowrap'}}>
                        <FlexItem><HeartbeatIcon/></FlexItem>
                        <FlexItem>{title}</FlexItem>
                    </Flex>
                </CardTitle>
            </CardHeader>
            <CardBody>
                <LoadingContent
                    unavailable={unavailable}
                    loading={loading}
                    error={error}
                    hasData={data != null}
                    spinnerSize="md"
                >
                    {summary && (
                        <Flex direction={{default: 'column'}} spaceItems={{default: 'spaceItemsSm'}}>
                            <FlexItem>
                                <Flex spaceItems={{default: 'spaceItemsSm'}} alignItems={{default: 'alignItemsCenter'}} flexWrap={{default: 'nowrap'}}>
                                    <FlexItem><HealthStatusIcon state={summary.state}/></FlexItem>
                                    <FlexItem>{summary.label}</FlexItem>
                                </Flex>
                            </FlexItem>
                            {hasIssues && (
                                <FlexItem>
                                    <Button variant="link" isInline onClick={() => cockpit.location.go(['health'])}>
                                        {i18n("View details")}
                                    </Button>
                                </FlexItem>
                            )}
                        </Flex>
                    )}
                </LoadingContent>
            </CardBody>
        </Card>
    );
}
