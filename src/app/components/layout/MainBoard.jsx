/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * The main page: the tab sub-nav with a refresh button, then the selected tab.
 *
 * @file MainBoard.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useCallback, useRef, useState} from 'react';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';
import {Tooltip} from '@patternfly/react-core/dist/esm/components/Tooltip';
import {Flex, FlexItem} from '@patternfly/react-core/dist/esm/layouts/Flex';
import {Nav, NavItem, NavList} from '@patternfly/react-core/dist/esm/components/Nav';
import {Page, PageSection} from '@patternfly/react-core/dist/esm/components/Page';
import {SyncAltIcon} from '@patternfly/react-icons/dist/esm/icons/sync-alt-icon';

import {i18n} from '../../utils/i18n.js';

import {HealthProvider} from '../../hooks/HealthContext.js';
import {RefreshContext} from '../../hooks/RefreshContext.js';
import {useTab} from '../../hooks/useTab.js';
import {MODULES} from '../../modules/index.js';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */
/** @typedef {import('../../types/module.js').Module} Module */

/**
 * One item of the main tab sub-nav. Icon-only modules show the icon with a
 * tooltip and aria-label of the module name; other modules show the name as text.
 *
 * The tab bar is a PatternFly horizontal Nav, not Tabs, so the tooltip is
 * attached with NavItem.anchorRef and Tooltip triggerRef. That keeps the
 * Button as the NavItem child (nav-link styles still apply) and shows the
 * tooltip on hover and keyboard focus.
 *
 * @param {object} props Component props.
 * @param {Module} props.item The module.
 * @param {boolean} props.isActive True when this tab is selected.
 * @returns {React.ReactElement} The nav item, and a tooltip when the tab is icon-only.
 */
function ModuleNavItem({item, isActive}) {
    const Icon = item.icon;
    const anchorRef = useRef(/** @type {HTMLAnchorElement|null} */ (null));

    if (item.iconOnly && Icon) {
        return (
            <>
                <NavItem
                    itemId={item.id}
                    preventDefault
                    isActive={isActive}
                    anchorRef={anchorRef}
                >
                    <Button variant="link" component="a" aria-label={item.label}>
                        <Icon/>
                    </Button>
                </NavItem>
                <Tooltip content={item.label} triggerRef={anchorRef}/>
            </>
        );
    }

    return (
        <NavItem
            itemId={item.id}
            preventDefault
            isActive={isActive}
        >
            <Button variant="link" component="a">{item.label}</Button>
        </NavItem>
    );
}

/**
 * Shows the main page, laid out like Cockpit's Services page:
 * a header section with the sub-nav, then a section with the tab content.
 * Tab content is not wrapped in a plain Card: Cockpit's patternfly-6-overrides.scss
 * sets padding-inline: 0 on any descendant .pf-v6-c-card__header inside .pf-m-plain,
 * which would pull Overview card titles onto the card border.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @returns {React.ReactElement} The main page.
 */
export function MainBoard({mode}) {
    const [tab, go] = useTab(MODULES.map(item => item.id), MODULES[0].id);
    const Current = MODULES.find(item => item.id === tab).Page;
    const [refreshToken, setRefreshToken] = useState(0);
    const refresh = useCallback(() => setRefreshToken(count => count + 1), []);
    const showRefresh = tab === 'overview' || tab === 'containers' || tab === 'health' || tab === 'volumes' || tab === 'networks' || tab === 'images' || tab === 'secrets' || tab === 'services' || tab === 'quadlets';

    return (
        <RefreshContext.Provider value={refreshToken}>
            <HealthProvider>
                <Page className="pf-m-no-sidebar">
                    <PageSection hasBodyWrapper={false} className="podshift-header">
                        <Flex
                            justifyContent={{default: 'justifyContentSpaceBetween'}}
                            alignItems={{default: 'alignItemsCenter'}}
                            flexWrap={{default: 'nowrap'}}
                        >
                            <Nav
                                variant="horizontal-subnav"
                                id="podshift-tabs"
                                onSelect={(_event, result) => go(result.itemId)}
                            >
                                <NavList>
                                    {MODULES.map(item => (
                                        <ModuleNavItem
                                            key={item.id}
                                            item={item}
                                            isActive={item.id === tab}
                                        />
                                    ))}
                                </NavList>
                            </Nav>
                            {showRefresh && (
                                <FlexItem>
                                    <Tooltip content={i18n("Refresh")}>
                                        <Button variant="plain" aria-label={i18n("Refresh")} onClick={refresh}>
                                            <SyncAltIcon/>
                                        </Button>
                                    </Tooltip>
                                </FlexItem>
                            )}
                        </Flex>
                    </PageSection>
                    <PageSection hasBodyWrapper={false}>
                        <div id={"podshift-tab-" + tab}>
                            <Current mode={mode}/>
                        </div>
                    </PageSection>
                </Page>
            </HealthProvider>
        </RefreshContext.Provider>
    );
}
