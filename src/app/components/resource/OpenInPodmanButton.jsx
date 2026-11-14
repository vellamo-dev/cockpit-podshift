/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Link button that opens the Cockpit Podman page for the podshift user, when that page is installed.
 *
 * @file OpenInPodmanButton.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';
import {ExternalLinkAltIcon} from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {isPodmanPageInstalled} from '../../utils/isPodmanPageInstalled.js';

/**
 * UID of the podshift user, used as the Cockpit Podman page owner.
 *
 * @type {number}
 */
const PODSHIFT_UID = 300;

/**
 * Opens the Cockpit Podman page for the podshift user.
 * Hash and query go in the path string; jump() has no separate location argument.
 */
function handleOpenPodman() {
    cockpit.jump('/podman#/?owner=' + PODSHIFT_UID);
}

/**
 * Shows a link button to the Cockpit Podman page when that package is installed.
 *
 * @returns {React.ReactElement|null} The button, or null when the Podman page is not installed.
 */
export function OpenInPodmanButton() {
    if (!isPodmanPageInstalled()) { return null }

    return (
        <Button
            variant="link"
            icon={<ExternalLinkAltIcon/>}
            iconPosition="end"
            onClick={handleOpenPodman}
        >
            {i18n("Show in Podman UI")}
        </Button>
    );
}
