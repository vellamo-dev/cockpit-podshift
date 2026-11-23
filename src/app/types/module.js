/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared data shapes for the module list of the main page, and for the resource
 * module base class and its page state.
 *
 * @file module.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * Props every module page receives.
 *
 * @typedef {object} ModuleProps
 * @property {import('./api.js').AccessMode} mode Access mode of the user.
 */

/**
 * One module of the main page.
 *
 * @typedef {object} Module
 * @property {string} id Module key, also used in the page address.
 * @property {string} label Translated name shown in the tab sub-nav, and in the tooltip and aria-label of an icon-only tab.
 * @property {import('react').ComponentType<ModuleProps>} Page Module page content.
 * @property {import('./resource.js').PatternFlyIcon} [icon] PatternFly icon shown as the tab title when iconOnly is true.
 * @property {boolean} [iconOnly] True when the tab shows only the icon, with the label in a tooltip and aria-label.
 * @property {string[]} [requires] Handler actions the tab needs; once the capabilities are read, the tab is hidden when one is missing.
 * @property {string[]} [optional] Handler actions of single features of the tab; the tab hides a feature whose action is missing.
 * @property {boolean} [refresh] True shows the header Refresh button on this tab.
 * @property {boolean} [autoRefresh] True shows the header Auto refresh toggle on this tab, and its polling follows it.
 */

/**
 * Fields every item of a card grid module has, so BaseModule, its filters and
 * compareResources can show, search and sort it. ResourceItem and ServiceItem both fit.
 *
 * @typedef {object} ModuleItem
 * @property {string} id Real name of the item; also the React key.
 * @property {string} title Display name.
 * @property {string} [subtitle] Text shown under the title.
 * @property {import('./resource.js').ResourceSourceId} [source] Source key, see ResourceSource.
 */

/**
 * Settings a resource module instance is built from. The constructor copies each
 * field onto the instance. emptyBody, kind, variables, showOpenInPodman and
 * quadletView are optional or needed so BaseModule.render() can match the current resource
 * pages; subclasses set them in the constructor alongside the required fields.
 *
 * @template {ModuleItem} [T=import('./resource.js').ResourceItem] Item type of the list.
 * @typedef {object} ModuleSettings
 * @property {string} id Module key, also used in the page address, for example 'containers'.
 * @property {string} label Translated name shown in the tab sub-nav.
 * @property {'containers-list'|'images-list'|'volumes-list'|'networks-list'|'secrets-list'|'services-list'|'quadlets-list'} action List action the page loads.
 * @property {import('./inspect.js').InspectKind} [kind] Resource kind passed to the inspect view modal; left out when the module has no Inspect view (services).
 * @property {import('../modules/filters/BaseFilter.js').BaseFilter<T>|import('../modules/filters/BaseFilter.js').BaseFilter<T>[]} filter Toolbar toggle filter, or several that all apply, for example a SourceFilter, or State and Type on Quadlets.
 * @property {string} emptyTitle Translated empty-state title, for example "No containers".
 * @property {string} emptyBody Translated empty-state body, for example "No matching containers.".
 * @property {string} idPrefix Prefix of card element ids, for example 'podshift-container-'.
 * @property {import('./resource.js').PatternFlyIcon} icon PatternFly icon component shown on each card.
 * @property {boolean} [variables] True when useResourceView should add a Variables item after Inspect (containers).
 * @property {boolean} [showOpenInPodman] True when the toolbar may show Open in the Podman page (containers and images).
 * @property {boolean} [quadletView] False when the cards have no Show Quadlet item, so render() leaves out the unit view (secrets).
 */

/**
 * List as the list actions return it: the items of one module.
 *
 * @template {ModuleItem} [T=import('./resource.js').ResourceItem] Item type of the list.
 * @typedef {object} ModuleList
 * @property {T[]} items The items.
 */

/**
 * Hook state a resource module page passes to BaseModule.render(). The page (or
 * useModulePage) gathers this from useAction, useResourceView, useUnitView and
 * the search and toggle filter inputs. filter is the raw SearchInput value; render()
 * trims and lowercases it for filtering. filterValues holds the selected option of each
 * toolbar toggle filter, in the same order as the module filters.
 *
 * @template {ModuleItem} [T=import('./resource.js').ResourceItem] Item type of the list.
 * @typedef {object} ModulePageState
 * @property {ModuleList<T>|null} data Last good list, or null before the first load.
 * @property {Error|null} error Error of the last load, or null.
 * @property {boolean} loading True while the first load runs.
 * @property {string|null} unavailable Text shown when the view cannot be used, or null.
 * @property {import('./api.js').AccessMode} mode Access mode of the user.
 * @property {string} filter Raw text of the filter field.
 * @property {(value: string) => void} setFilter Sets the filter field text.
 * @property {string[]} filterValues Selected option id of each toolbar toggle filter, in module filter order, for example 'all' or 'quadlet'.
 * @property {(index: number, id: string) => void} setFilterValue Sets the selected option of the toggle filter at the given index.
 * @property {() => Promise<void>} refresh Loads the list action again.
 * @property {import('./inspect.js').ResourceView|null} view The open Inspect or Variables view, or null.
 * @property {(ref: string, name: string) => import('./card.js').MenuItem[]} viewActions Menu items that open the views of one resource.
 * @property {() => void} closeView Closes the open Inspect or Variables view.
 * @property {import('./service.js').UnitView|null} unitView The open unit view, or null.
 * @property {(view: import('./service.js').UnitView) => void} openUnitView Opens a unit view, replacing the open one.
 * @property {(item: import('./resource.js').ResourceItem) => (import('./card.js').MenuItem|import('./card.js').MenuDivider)[]} quadletActions Builds a divider and Show Quadlet for a Quadlet resource card, or nothing.
 * @property {() => void} closeUnitView Closes the unit view.
 * @property {(action: string) => boolean} canUse Tells whether an optional handler action can be used, from the capabilities.
 * @property {import('./drop.js').UninstallTarget|null} uninstall The open Uninstall confirm modal, or null.
 * @property {(target: import('./drop.js').UninstallTarget) => void} openUninstall Opens the Uninstall confirm modal for a target.
 * @property {() => void} closeUninstall Closes the Uninstall modal without a change.
 * @property {(target: import('./drop.js').UninstallTarget) => void} uninstallQueued Closes the modal after the removal was queued, shows a notice and loads the list again.
 * @property {(target: import('./drop.js').UninstallTarget) => boolean} isUninstallQueued Tells whether the removal of a target was queued a short while ago, so its Uninstall item is disabled.
 * @property {import('./drop.js').UninstallTarget|null} uninstallNotice The target of the last queued uninstall, shown as a notice, or null.
 * @property {() => void} dismissUninstallNotice Hides the uninstall notice.
 */

/**
 * Auto refresh state of the current page, from MainBoard. Outside MainBoard and on a tab without
 * autoRefresh it is always on and start and stop do nothing.
 *
 * @typedef {object} AutoRefreshState
 * @property {boolean} on True while polling may run.
 * @property {boolean} ranOut True when it is off because the countdown ran out.
 * @property {number|null} startedAt Time of the last (re)start in ms since the epoch, or null while off.
 * @property {() => void} start Turns it on and restarts the countdown, without a reload.
 * @property {() => void} stop Turns it off.
 * @property {(held: boolean) => void} hold True makes the countdown wait; false lets it run again from a fresh start.
 */

export {};
