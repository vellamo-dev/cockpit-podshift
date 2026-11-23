/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * The main page: the tab sub-nav with an auto refresh toggle and a refresh button, then the
 * selected tab. The refresh button shows a spinner and is disabled while a load of the visible
 * tab runs. The tabs follow the capabilities of the installed PodShift.
 *
 * @file MainBoard.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';
import {Tooltip} from '@patternfly/react-core/dist/esm/components/Tooltip';
import {Flex, FlexItem} from '@patternfly/react-core/dist/esm/layouts/Flex';
import {Nav, NavItem, NavList} from '@patternfly/react-core/dist/esm/components/Nav';
import {Page, PageSection} from '@patternfly/react-core/dist/esm/components/Page';
import {Spinner} from '@patternfly/react-core/dist/esm/components/Spinner';
import {RhUiAsleepIcon} from '@patternfly/react-icons/dist/esm/icons/rh-ui-asleep-icon';
import {RhUiAutomationIcon} from '@patternfly/react-icons/dist/esm/icons/rh-ui-automation-icon';
import {SyncAltIcon} from '@patternfly/react-icons/dist/esm/icons/sync-alt-icon';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {AutoRefresh} from '../../utils/AutoRefresh.js';
import {visibleModules} from '../../utils/capabilities.js';

import {AUTO_REFRESH_ALWAYS_ON, AutoRefreshContext} from '../../hooks/AutoRefreshContext.js';
import {CapabilitiesProvider, useCapabilities} from '../../hooks/CapabilitiesContext.js';
import {HealthProvider} from '../../hooks/HealthContext.js';
import {RefreshActivityContext, RefreshContext} from '../../hooks/RefreshContext.js';
import {useTab} from '../../hooks/useTab.js';
import {MODULES} from '../../modules/index.js';
import {InlineNotice} from '../common/InlineNotice.jsx';
import {LoadingContent} from '../common/LoadingContent.jsx';

/** @typedef {import('../../types/api.js').AccessMode} AccessMode */
/** @typedef {import('../../types/module.js').Module} Module */
/** @typedef {import('../../types/module.js').AutoRefreshState} AutoRefreshState */

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
                <Tooltip content={item.label} triggerRef={anchorRef} position="bottom" flipBehavior={["bottom"]}/>
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
 * Takes the place of the tabs while the capabilities load for the first time: one nav item
 * built like a real tab, with a small spinner, so the tab bar keeps its height.
 *
 * @returns {React.ReactElement} The placeholder nav item.
 */
function LoadingNavItem() {
    return (
        <NavItem itemId="podshift-loading" preventDefault isActive={false}>
            <Button variant="link" component="span" tabIndex={-1}>
                <Spinner size="md" isInline aria-label={i18n("Checking PodShift access")}/>
            </Button>
        </NavItem>
    );
}

/**
 * The header Auto refresh toggle: an automation icon while auto refresh is on, a sleeping one
 * while it is off. The tooltip says which, and whether the countdown turned it off.
 *
 * @param {object} props Component props.
 * @param {boolean} props.on True while auto refresh is on.
 * @param {boolean} props.ranOut True when the countdown turned it off.
 * @param {() => void} props.onToggle Turns it off, or on like a Refresh click.
 * @returns {React.ReactElement} The toggle button with its tooltip.
 */
function AutoRefreshToggle({on, ranOut, onToggle}) {
    let tip = i18n("Auto refresh is off. Click to turn it on.");
    if (on) {
        tip = i18n("Auto refresh is on. Click to turn it off.");
    } else if (ranOut) {
        tip = cockpit.format(i18n("Auto refresh turned off after $0 minutes. Click to turn it on."), AutoRefresh.offAfterMinutes());
    }

    return (
        <Tooltip content={tip} position="bottom" flipBehavior={["bottom"]}>
            <Button
                variant="plain"
                aria-label={i18n("Auto refresh")}
                aria-pressed={on}
                onClick={onToggle}
            >
                {on ? <RhUiAutomationIcon/> : <RhUiAsleepIcon/>}
            </Button>
        </Tooltip>
    );
}

/**
 * Shows the main page, laid out like Cockpit's Services page:
 * a header section with the sub-nav, then a section with the tab content.
 * Tab content is not wrapped in a plain Card: Cockpit's patternfly-6-overrides.scss
 * sets padding-inline: 0 on any descendant .pf-v6-c-card__header inside .pf-m-plain,
 * which would pull Overview card titles onto the card border.
 * MainBoard holds the refresh counter, the refresh progress, the capabilities and the auto
 * refresh state with its one countdown timer: once turned on or restarted, auto refresh turns
 * itself off after AutoRefresh.OFF_AFTER_MS (4 minutes). A page can hold the countdown, as
 * Drop Quadlet does while an item is in progress; when the hold ends, the countdown starts again
 * from a fresh 4 minutes. The tabs and their content are in MainBoardContent, inside those
 * providers.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @returns {React.ReactElement} The main page.
 */
export function MainBoard({mode}) {
    const [refreshToken, setRefreshToken] = useState(0);
    const refresh = useCallback(() => setRefreshToken(count => count + 1), []);
    const [running, setRunning] = useState(0);
    const report = useCallback(() => {
        let open = true;
        setRunning(count => count + 1);
        return () => {
            if (!open) { return }
            open = false;
            setRunning(count => count - 1);
        };
    }, []);
    const [autoStartedAt, setAutoStartedAt] = useState(/** @type {number|null} */ (null));
    const [autoRanOut, setAutoRanOut] = useState(false);
    const autoOn = autoStartedAt !== null;
    const startAuto = useCallback(() => {
        setAutoRanOut(false);
        setAutoStartedAt(Date.now());
    }, []);
    const stopAuto = useCallback(() => {
        setAutoRanOut(false);
        setAutoStartedAt(null);
    }, []);
    const [autoHeld, setAutoHeld] = useState(false);
    const autoHeldRef = useRef(false);
    const holdAuto = useCallback(function holdAuto(held) {
        if (autoHeldRef.current === held) { return }
        autoHeldRef.current = held;
        setAutoHeld(held);
        if (!held) { setAutoStartedAt(current => (current === null ? null : Date.now())) }
    }, []);
    const autoRefresh = useMemo(
        () => ({on: autoOn, ranOut: autoRanOut, startedAt: autoStartedAt, start: startAuto, stop: stopAuto, hold: holdAuto}),
        [autoOn, autoRanOut, autoStartedAt, startAuto, stopAuto, holdAuto]
    );

    useEffect(() => {
        if (autoStartedAt === null || autoHeld) { return undefined }
        const timer = window.setTimeout(() => {
            setAutoRanOut(true);
            setAutoStartedAt(null);
        }, AutoRefresh.msLeft(autoStartedAt, Date.now()));
        return () => window.clearTimeout(timer);
    }, [autoStartedAt, autoHeld]);

    return (
        <RefreshContext.Provider value={refreshToken}>
            <RefreshActivityContext.Provider value={report}>
                <CapabilitiesProvider>
                    <HealthProvider>
                        <MainBoardContent
                            mode={mode}
                            refreshing={running > 0}
                            onRefresh={refresh}
                            autoRefresh={autoRefresh}
                        />
                    </HealthProvider>
                </CapabilitiesProvider>
            </RefreshActivityContext.Provider>
        </RefreshContext.Provider>
    );
}

/**
 * Shows the tab sub-nav, the refresh button and the selected tab. Only tabs whose required
 * actions the installed PodShift offers are shown. While the capabilities load for the first
 * time there is a spinner in place of the tabs and no page, so no tab appears and then goes,
 * and no page loads data it may not use. When they could not be read, every tab is shown with
 * a warning. A selected tab that is hidden is never mounted: the first shown tab is rendered
 * at once, and the page address follows.
 * On a tab with autoRefresh, auto refresh turns on with a fresh countdown when the tab becomes
 * the active one, when the browser tab is shown again and on a Refresh click; it turns off when
 * the browser tab is hidden. A tab without the flag gets auto refresh that is always on, so it
 * polls as before, and leaving a tab with the flag turns it off. A click on the toggle turns it
 * off, or on like a Refresh click (one reload and a fresh countdown); while a load already runs
 * it only turns it on, so nothing loads twice.
 *
 * @param {object} props Component props.
 * @param {AccessMode} props.mode Access mode of the user.
 * @param {boolean} props.refreshing True while a load of the visible tab runs.
 * @param {() => void} props.onRefresh Reloads the data of the visible tab.
 * @param {AutoRefreshState} props.autoRefresh Auto refresh state from MainBoard.
 * @returns {React.ReactElement} The page.
 */
function MainBoardContent({mode, refreshing, onRefresh, autoRefresh}) {
    const caps = useCapabilities();
    const firstLoad = caps.status === 'loading';
    const shown = visibleModules(MODULES, caps);
    const [tab, go] = useTab(MODULES.map(item => item.id), MODULES[0].id);
    const current = shown.find(item => item.id === tab) || shown[0] || null;
    const Current = current ? current.Page : null;
    const showRefresh = current?.refresh === true;
    const autoPage = current?.autoRefresh === true;
    const currentId = current ? current.id : null;
    const {start: startAuto, stop: stopAuto} = autoRefresh;

    useEffect(() => {
        if (current && current.id !== tab) { go(current.id) }
    }, [current, tab, go]);

    useEffect(function followActiveTab() {
        if (autoPage) {
            startAuto();
        } else {
            stopAuto();
        }
    }, [currentId, autoPage, startAuto, stopAuto]);

    useEffect(function followBrowserTab() {
        if (!autoPage) { return undefined }

        /**
         * Turns auto refresh off while the browser tab is hidden, and on again when it is shown.
         */
        function onVisibility() {
            if (document.hidden) {
                stopAuto();
            } else {
                startAuto();
            }
        }

        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, [autoPage, startAuto, stopAuto]);

    const autoOn = autoRefresh.on;
    const refreshTab = useCallback(function refreshTab() {
        onRefresh();
        if (autoPage) { startAuto() }
    }, [onRefresh, autoPage, startAuto]);
    const toggleAuto = useCallback(function toggleAuto() {
        if (autoOn) {
            stopAuto();
            return;
        }
        if (refreshing) {
            startAuto();
            return;
        }
        refreshTab();
    }, [autoOn, refreshing, startAuto, stopAuto, refreshTab]);

    return (
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
                        onSelect={(_event, result) => {
                            if (shown.some(item => item.id === result.itemId)) { go(String(result.itemId)) }
                        }}
                    >
                        <NavList>
                            {firstLoad && <LoadingNavItem/>}
                            {shown.map(item => (
                                <ModuleNavItem
                                    key={item.id}
                                    item={item}
                                    isActive={item.id === current?.id}
                                />
                            ))}
                        </NavList>
                    </Nav>
                    {showRefresh && (
                        <FlexItem>
                            {autoPage && <AutoRefreshToggle on={autoOn} ranOut={autoRefresh.ranOut} onToggle={toggleAuto}/>}
                            <Tooltip content={i18n("Refresh")} position="bottom" flipBehavior={["bottom"]}>
                                <Button
                                    variant="plain"
                                    aria-label={i18n("Refresh")}
                                    isAriaDisabled={refreshing}
                                    onClick={refreshTab}
                                >
                                    {refreshing ? <Spinner size="md" isInline aria-label={i18n("Refresh")}/> : <SyncAltIcon/>}
                                </Button>
                            </Tooltip>
                        </FlexItem>
                    )}
                </Flex>
            </PageSection>
            <AutoRefreshContext.Provider value={autoPage ? autoRefresh : AUTO_REFRESH_ALWAYS_ON}>
                <PageSection hasBodyWrapper={false}>
                    {caps.status === 'error' && (
                        <div className="podshift-capabilities-warning">
                            <InlineNotice
                                variant="warning"
                                title={cockpit.format(i18n("Could not read capabilities: $0"), caps.error?.message || String(caps.error))}
                            />
                        </div>
                    )}
                    {firstLoad && <LoadingContent loading spinnerSize="lg"/>}
                    {!firstLoad && (Current
                        ? (
                            <div id={"podshift-tab-" + current.id}>
                                <Current mode={mode}/>
                            </div>
                        )
                        : <InlineNotice variant="info" title={i18n("This PodShift version offers none of these views.")}/>)}
                </PageSection>
            </AutoRefreshContext.Provider>
        </Page>
    );
}
