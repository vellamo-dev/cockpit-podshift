/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Decides whether a card can be uninstalled and what the Uninstall item removes: one installed
 * Quadlet file, or the whole app (bundle) it belongs to. The Quadlets tab gives the file name
 * and app of a Quadlet; the Containers, Volumes and Networks tabs give the quadlet field that
 * PodShift adds to an item made by an installed Quadlet file. Pure, so it has unit tests.
 *
 * @file QuadletUninstall.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/** @typedef {import('../types/drop.js').UninstallTarget} UninstallTarget */
/** @typedef {import('../types/quadlet.js').QuadletItem} QuadletItem */
/** @typedef {import('../types/resource.js').QuadletOwner} QuadletOwner */
/** @typedef {import('../types/resource.js').ResourceItem} ResourceItem */

/**
 * Uninstall target helpers shared by the Quadlets, Containers, Volumes and Networks tabs.
 */
export class QuadletUninstall {
    /**
     * Quadlet file suffixes that quadlet-remove accepts as a single file.
     *
     * @type {RegExp}
     */
    static QUADLET_FILE = /^[^/]+\.(container|pod|kube|network|volume|image|build)$/;

    /**
     * Builds the uninstall target of a Quadlet file and its app. A file in an app uninstalls the
     * whole app, because quadlet-remove only takes a single file at the top of the Quadlet folder
     * or an app name. Anything that is not a Quadlet file name gives null.
     *
     * @param {Partial<QuadletOwner>|null|undefined} owner The file name and, for a file in a bundle, the app name.
     * @returns {UninstallTarget|null} What Uninstall removes, or null when nothing can be uninstalled.
     */
    static fromOwner(owner) {
        const file = typeof owner?.name === 'string' ? owner.name : '';
        if (!QuadletUninstall.QUADLET_FILE.test(file)) { return null }
        const app = typeof owner?.app === 'string' ? owner.app.trim() : '';
        if (app !== '' && !app.includes('/')) { return {name: app, isApp: true, file} }
        return {name: file, isApp: false, file};
    }

    /**
     * Builds the uninstall target of a container, volume or network card. Only items with the
     * quadlet field, which PodShift sets for items made by an installed Quadlet file, have one.
     *
     * @param {ResourceItem|null|undefined} item The resource.
     * @returns {UninstallTarget|null} What Uninstall removes, or null for other items.
     */
    static fromResource(item) {
        return QuadletUninstall.fromOwner(item?.quadlet);
    }

    /**
     * Builds the uninstall target of a Quadlets tab card: the file (id), or its app when set.
     *
     * @param {QuadletItem|null|undefined} item The Quadlet.
     * @returns {UninstallTarget|null} What Uninstall removes, or null when the id is not a Quadlet file name.
     */
    static fromQuadlet(item) {
        return QuadletUninstall.fromOwner({name: item?.id, app: item?.app});
    }

    /**
     * Tells whether a list still has an item that the queued Uninstall removes: a card whose own
     * Uninstall target has the same name. Items with the quadlet field are resources; the others
     * are taken as Quadlets tab items.
     *
     * @param {(ResourceItem|QuadletItem)[]|null|undefined} items The list items.
     * @param {string} name The name sent to quadlet-remove.
     * @returns {boolean} True while such an item is in the list.
     */
    static listHas(items, name) {
        if (!Array.isArray(items)) { return false }
        return items.some(item => {
            const target = 'quadlet' in item
                ? QuadletUninstall.fromResource(/** @type {ResourceItem} */ (item))
                : QuadletUninstall.fromQuadlet(/** @type {QuadletItem} */ (item));
            return target?.name === name;
        });
    }

    /**
     * Tells whether the modal offers the Also delete volume data option: for an app, and for a single
     * .volume file, the only cases where quadlet-remove has volumes to remove.
     *
     * @param {UninstallTarget} target What Uninstall removes.
     * @returns {boolean} True when the option is shown.
     */
    static offersVolumes(target) {
        return target.isApp || target.file.endsWith('.volume');
    }
}
