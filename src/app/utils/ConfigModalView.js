/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Decides what the shared add and edit modal of the Configuration card shows.
 *
 * @file ConfigModalView.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/** @typedef {import('../types/card.js').ConfigModalMode} ConfigModalMode */
/** @typedef {import('../types/card.js').ConfigModalLayout} ConfigModalLayout */

/**
 * The layout of the variable modal for each mode. All members are static; this class is not constructed.
 */
export class ConfigModalView {
    /**
     * Returns what the modal shows: add has an open name and no Remove; edit locks the
     * name and has Remove; confirm (after Remove in edit) asks before removing.
     *
     * @param {ConfigModalMode} mode 'add' or 'edit'.
     * @param {boolean} confirming True after Remove was chosen in edit mode.
     * @returns {ConfigModalLayout} The layout.
     */
    static layout(mode, confirming) {
        if (mode === 'edit' && confirming) {
            return {title: 'remove', showForm: false, nameLocked: true, showRemove: false, showSave: false, showConfirm: true};
        }
        if (mode === 'edit') {
            return {title: 'edit', showForm: true, nameLocked: true, showRemove: true, showSave: true, showConfirm: false};
        }
        return {title: 'add', showForm: true, nameLocked: false, showRemove: false, showSave: true, showConfirm: false};
    }
}
