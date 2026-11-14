/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Card icons of the resource modules, shared so Quadlets can use the same icon as
 * Containers, Volumes, Networks and Images.
 *
 * @file ResourceIcons.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {BlueprintIcon} from '@patternfly/react-icons/dist/esm/icons/blueprint-icon';
import {CubeIcon} from '@patternfly/react-icons/dist/esm/icons/cube-icon';
import {CubesIcon} from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import {FileCodeIcon} from '@patternfly/react-icons/dist/esm/icons/file-code-icon';
import {HddIcon} from '@patternfly/react-icons/dist/esm/icons/hdd-icon';
import {NetworkIcon} from '@patternfly/react-icons/dist/esm/icons/network-icon';

/** @typedef {import('../types/quadlet.js').QuadletKind} QuadletKind */
/** @typedef {import('../types/resource.js').PatternFlyIcon} PatternFlyIcon */

/**
 * Card icons of the resource modules. All members are static; this class is not constructed.
 */
export class ResourceIcons {
    /**
     * Icon of a container card (and of a .container Quadlet).
     *
     * @type {PatternFlyIcon}
     */
    static container = CubeIcon;

    /**
     * Icon of a volume card (and of a .volume Quadlet).
     *
     * @type {PatternFlyIcon}
     */
    static volume = HddIcon;

    /**
     * Icon of a network card (and of a .network Quadlet).
     *
     * @type {PatternFlyIcon}
     */
    static network = NetworkIcon;

    /**
     * Icon of an image card (and of a .image Quadlet).
     *
     * @type {PatternFlyIcon}
     */
    static image = BlueprintIcon;

    /**
     * Icon of a .pod Quadlet.
     *
     * @type {PatternFlyIcon}
     */
    static pod = CubesIcon;

    /**
     * Icon of a .kube Quadlet.
     *
     * @type {PatternFlyIcon}
     */
    static kube = FileCodeIcon;

    /**
     * Default Quadlet card icon, used when the type is unknown.
     *
     * @type {PatternFlyIcon}
     */
    static quadlet = FileCodeIcon;

    /**
     * Card icon for each known Quadlet type. Types not in this map use quadlet.
     *
     * @type {Record<string, PatternFlyIcon>}
     */
    static QUADLET = {
        container: ResourceIcons.container,
        volume: ResourceIcons.volume,
        network: ResourceIcons.network,
        image: ResourceIcons.image,
        pod: ResourceIcons.pod,
        kube: ResourceIcons.kube,
    };

    /**
     * Returns the card icon for a Quadlet type, or the Quadlet fallback when the type is unknown.
     *
     * @param {QuadletKind} [type] Type taken from the file name suffix, when it is a known kind.
     * @returns {PatternFlyIcon} The icon component.
     */
    static forQuadlet(type) {
        if (type) {
            const icon = ResourceIcons.QUADLET[type];
            if (icon) { return icon }
        }
        return ResourceIcons.quadlet;
    }
}
