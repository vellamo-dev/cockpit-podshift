/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Base class of the toolbar filters of the resource modules: the toggle group
 * settings and the check whether an item passes the selected option.
 *
 * @file BaseFilter.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/** @typedef {import('../../types/filter.js').FilterOption} FilterOption */
/** @typedef {import('../../types/filter.js').FilterSettings} FilterSettings */

/**
 * A toggle group filter of a resource module. Subclasses override options() and
 * matchesOption(); matches() lets every item pass the All option. FilterToggle
 * renders the toggle group from the instance.
 *
 * @template {object} T Item type the filter checks.
 */
export class BaseFilter {
    /**
     * Option id that lets every item pass.
     *
     * @type {string}
     */
    static ALL = 'all';

    /**
     * Builds a filter from its settings and stores them on the instance.
     *
     * @param {FilterSettings} settings Id prefix, aria label and default option.
     */
    constructor(settings) {
        this.idPrefix = settings.idPrefix;
        this.label = settings.label;
        this.defaultValue = settings.defaultValue || BaseFilter.ALL;
    }

    /**
     * Returns the toggle options, in display order. Subclasses must override this.
     *
     * @abstract
     * @returns {FilterOption[]} The options, All first.
     * @throws {Error} When the subclass has not implemented it.
     */
    options() {
        throw new Error(`${BaseFilter.#className(this.constructor)}.options() must be implemented`);
    }

    /**
     * Checks whether an item passes the selected option. All always passes;
     * any other option is checked by matchesOption().
     *
     * @param {T} item The item.
     * @param {string} value Selected option id.
     * @returns {boolean} True when the item is shown.
     */
    matches(item, value) {
        if (value === BaseFilter.ALL) { return true }
        return this.matchesOption(item, value);
    }

    /**
     * Checks whether an item passes an option other than All. Subclasses must override this.
     *
     * @abstract
     * @param {T} item The item.
     * @param {string} value Selected option id, never 'all'.
     * @returns {boolean} True when the item is shown.
     * @throws {Error} When the subclass has not implemented it.
     */
    matchesOption(item, value) {
        throw new Error(`${BaseFilter.#className(this.constructor)}.matchesOption(${value}) must be implemented`);
    }

    /**
     * Returns one filter or several as an array, so a module can pass either.
     *
     * @template {object} [F=object] Item type the filters check.
     * @param {BaseFilter<F>|BaseFilter<F>[]} filter One filter, or several that all apply.
     * @returns {BaseFilter<F>[]} The filters, in display order.
     */
    static list(filter) {
        return Array.isArray(filter) ? filter : [filter];
    }

    /**
     * Returns the name of a filter class, for error messages.
     * String() keeps the return a string, since WebStorm does not type the built-in class name as one.
     *
     * @param {Function} filterClass The filter class, for example SourceFilter.
     * @returns {string} The class name.
     */
    static #className(filterClass) {
        return String(filterClass.name);
    }
}
