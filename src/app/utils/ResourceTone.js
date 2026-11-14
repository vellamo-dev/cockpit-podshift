/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Status tone of resource cards (the colour of the corner tint), from the list items the
 * PodShift handlers return.
 *
 * @file ResourceTone.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/** @typedef {import('../types/card.js').CardTone} CardTone */
/** @typedef {import('../types/resource.js').ResourceRow} ResourceRow */
/** @typedef {import('../types/resource.js').ResourceRowGroup} ResourceRowGroup */
/** @typedef {import('../types/resource.js').ResourceItem} ResourceItem */

/**
 * Status tone of resource cards, from the list items the PodShift handlers return.
 * All members are static; this class is not constructed.
 */
export class ResourceTone {
    /**
     * Finds the value of a row by its id.
     *
     * @param {ResourceRow[]} [rows] The rows, untranslated.
     * @param {string} id Row id, for example 'state'.
     * @returns {string|null} The value, or null when the row is missing.
     */
    static #rowValue(rows, id) {
        const row = (rows || []).find(item => item.id === id);
        return row?.value != null ? String(row.value) : null;
    }

    /**
     * Tells whether the card's systemd group has a failed unit (unit_state "failed").
     *
     * @param {ResourceRowGroup[]} [groups] Row groups of the item, untranslated.
     * @returns {boolean} True when the unit failed.
     */
    static #unitFailed(groups) {
        const group = (groups || []).find(item => item.id === 'systemd');
        return ResourceTone.#rowValue(group?.rows, 'unit_state') === 'failed';
    }

    /**
     * Reads the exit code from a podman status text such as "Exited (137) 2 hours ago".
     *
     * @param {string|null} [state] The podman status text.
     * @returns {number|null} The exit code, or null when the text has none.
     */
    static #exitCodeFromState(state) {
        const match = /^Exited \((-?[0-9]+)\)/.exec(state || '');
        return match ? Number(match[1]) : null;
    }

    /**
     * Tone of a container card. danger: exited with a non-zero code, unhealthy, a failed systemd
     * unit, or auto-update set but without effect. success: running. Anything else is neutral,
     * including paused, created and exited with code 0.
     *
     * @param {ResourceItem} item The containers-list item, untranslated.
     * @returns {CardTone} The tone.
     */
    static containerTone(item) {
        const code = ResourceTone.#exitCodeFromState(ResourceTone.#rowValue(item.rows, 'state'));
        const problem = (code !== null && code !== 0) ||
            ResourceTone.#rowValue(item.rows, 'health') === 'Unhealthy' ||
            ResourceTone.#unitFailed(item.groups) ||
            (Boolean(item.autoUpdate) && item.autoUpdateActive === false);
        if (problem) { return 'danger' }
        return item.status === 'Running' ? 'success' : 'neutral';
    }

    /**
     * Tone of an image, volume or network card. danger: a failed systemd unit. success: in use or
     * used by a running container. Anything else is neutral, including unused and built-in.
     *
     * @param {ResourceItem} item The list item, untranslated.
     * @returns {CardTone} The tone.
     */
    static usageTone(item) {
        if (ResourceTone.#unitFailed(item.groups)) { return 'danger' }
        if (item.source === 'builtin') { return 'neutral' }
        return item.status === 'In use' || item.running === true ? 'success' : 'neutral';
    }
}
