/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * The list of modules on the main page, in display order.
 *
 * @file index.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {HeartbeatIcon} from '@patternfly/react-icons/dist/esm/icons/heartbeat-icon';
import {HomeIcon} from '@patternfly/react-icons/dist/esm/icons/home-icon';

import {i18n} from '../utils/i18n.js';

import {OverviewPage} from './overview/OverviewPage.jsx';
import {ContainersPage} from './containers/ContainersPage.jsx';
import {containersModule} from './containers/ContainersModule.jsx';
import {VolumesPage} from './volumes/VolumesPage.jsx';
import {volumesModule} from './volumes/VolumesModule.jsx';
import {NetworksPage} from './networks/NetworksPage.jsx';
import {networksModule} from './networks/NetworksModule.jsx';
import {ImagesPage} from './images/ImagesPage.jsx';
import {imagesModule} from './images/ImagesModule.jsx';
import {SecretsPage} from './secrets/SecretsPage.jsx';
import {secretsModule} from './secrets/SecretsModule.jsx';
import {ServicesPage} from './services/ServicesPage.jsx';
import {servicesModule} from './services/ServicesModule.jsx';
import {QuadletsPage} from './quadlets/QuadletsPage.jsx';
import {quadletsModule} from './quadlets/QuadletsModule.jsx';
import {HealthPage} from './health/HealthPage.jsx';

/** @typedef {import('../types/module.js').Module} Module */

/**
 * The module list, in display order. Add a module: one folder plus one line here.
 *
 * @type {Module[]}
 */
export const MODULES = [
    {id: 'overview', label: i18n("Overview"), Page: OverviewPage, icon: HomeIcon, iconOnly: true},
    {id: 'health', label: i18n("Health"), Page: HealthPage, icon: HeartbeatIcon, iconOnly: true},
    {id: containersModule.id, label: containersModule.label, Page: ContainersPage},
    {id: volumesModule.id, label: volumesModule.label, Page: VolumesPage},
    {id: networksModule.id, label: networksModule.label, Page: NetworksPage},
    {id: imagesModule.id, label: imagesModule.label, Page: ImagesPage},
    {id: secretsModule.id, label: secretsModule.label, Page: SecretsPage},
    {id: servicesModule.id, label: servicesModule.label, Page: ServicesPage},
    {id: quadletsModule.id, label: quadletsModule.label, Page: QuadletsPage},
];
