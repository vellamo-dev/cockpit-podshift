/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared data shapes for the inspect action and the Inspect and Variables views.
 *
 * @file inspect.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * Resource kinds the inspect action accepts.
 *
 * @typedef {'container'|'image'|'volume'|'network'|'secret'} InspectKind
 */

/**
 * Parsed JSON of one podman inspect object (container, image, volume, network or secret).
 * The shape depends on the kind and the podman version, so it is kept open.
 *
 * @typedef {Record<string, any>} InspectData
 */

/**
 * Temporary file written by the inspect action in file mode, owned by the podshift user, mode 0600.
 * The UI downloads it through a root external channel and then removes it.
 *
 * @typedef {object} InspectFile
 * @property {string} path Absolute path, for example /run/user/300/podshift/inspect-Ab12Cd34Ef.json.
 * @property {number} size Byte size of the file.
 */

/**
 * Data of the inspect action.
 *
 * @typedef {object} InspectResult
 * @property {InspectKind} kind Kind as requested.
 * @property {string} ref Name or ID as requested.
 * @property {boolean} found False when podman has no such resource.
 * @property {InspectData} [object] The inspect object; missing when found is false, tooLarge is true or in file mode.
 * @property {boolean} [tooLarge] True when the object does not fit in the response.
 * @property {number} [size] Byte size of the object as pretty JSON, set with tooLarge.
 * @property {InspectFile} [file] The temporary file, in file mode.
 */

/**
 * State returned by the useInspect hook.
 *
 * @typedef {object} InspectState
 * @property {InspectData|null} data The inspect object, or null while loading, on error, when closed, not found or too large.
 * @property {boolean} notFound True when podman has no such resource any more.
 * @property {number|null} tooLargeSize Byte size of an object too large to show, or null.
 * @property {Error|null} error Error of the load, or null.
 * @property {boolean} loading True while the load runs.
 */

/**
 * Which code view of a tab is open: Inspect or Variables of one resource.
 *
 * @typedef {object} ResourceView
 * @property {'inspect'|'variables'} mode The view.
 * @property {string} ref Name or ID passed to the inspect action.
 * @property {string} name Resource name, shown in the title.
 */

/**
 * State returned by the useResourceView hook.
 *
 * @typedef {object} ResourceViewState
 * @property {ResourceView|null} view The open view, or null.
 * @property {(ref: string, name: string) => import('./card.js').MenuItem[]} viewActions Menu items that open the views of one resource.
 * @property {() => void} closeView Closes the open view.
 */

export {};
