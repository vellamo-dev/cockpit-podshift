/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared data shapes for Quadlets as the Quadlets page shows them.
 *
 * @file quadlet.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * Which Quadlet file type a file comes from, taken from its suffix.
 *
 * @typedef {'container'|'pod'|'kube'|'network'|'volume'|'image'|'build'} QuadletKind
 */

/**
 * Status group used by the Quadlets toolbar filter and the card tone.
 *
 * @typedef {'active'|'inactive'|'failed'} QuadletStatusGroup
 */

/**
 * One Quadlet as the quadlets-list action returns it (mapped on the server from
 * `podman quadlet ls --format json`) and the Quadlets page shows it.
 *
 * @typedef {object} QuadletItem
 * @property {string} id Quadlet file name (Name); also the React key.
 * @property {string} title Display name, the Quadlet file name without its type suffix.
 * @property {QuadletKind} [type] Type taken from the file name suffix, when it is a known Quadlet kind.
 * @property {string} unitName systemd unit name; empty when unset.
 * @property {string} path Path of the Quadlet file on disk.
 * @property {string} status Raw status from podman, for example active/running or Not loaded.
 * @property {string} app Application name; empty when the Quadlet is not part of an app.
 * @property {string} pod Pod Quadlet name; empty when unset.
 * @property {string} description First Description= from the [Unit] section of the Quadlet file; empty when unset.
 */

/**
 * List of Quadlets as the quadlets-list action returns it.
 *
 * @typedef {object} QuadletList
 * @property {QuadletItem[]} items The Quadlets.
 */

/**
 * Page state of the Quadlets module: the shared module page state for Quadlet items.
 *
 * @typedef {import('./module.js').ModulePageState<QuadletItem>} QuadletsPageState
 */

export {};
