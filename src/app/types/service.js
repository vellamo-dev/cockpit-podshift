/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared data shapes for the systemd user services of the podshift user, as shown on the Services tab.
 * The services-list, service-view, service-logs and quadlet-view actions return them.
 *
 * @file service.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * systemd ActiveState of a unit. Units that are not found are never listed.
 *
 * @typedef {'active'|'inactive'|'failed'|'activating'|'deactivating'|'reloading'} ServiceActiveState
 */

/**
 * Which Quadlet file type a generated service comes from.
 *
 * @typedef {import('./quadlet.js').QuadletKind} QuadletKind
 */

/**
 * One systemd user service, as listed by `systemctl --user list-units --type=service --all`
 * plus the properties the card shows.
 *
 * @typedef {object} ServiceItem
 * @property {string} id Unit name, for example example-quadlet-container.service; also the React key.
 * @property {string} title Unit name.
 * @property {string} subtitle Unit description, or the unit name when it has none.
 * @property {'quadlet'|'unit'} source quadlet when Quadlet generated the unit, unit for a plain unit file.
 * @property {ServiceActiveState} activeState systemd ActiveState.
 * @property {string} subState systemd SubState, for example running, exited, dead, failed or start.
 * @property {string} since Time of the last state change, UTC ISO 8601; empty when unknown.
 * @property {string} unitFileState systemd UnitFileState, for example enabled, disabled, static or generated.
 * @property {string} [preset] Vendor preset, enabled or disabled; missing when the unit has none.
 * @property {string} path Path of the unit file that systemd loaded.
 * @property {string} [quadletFile] Quadlet only: the file the unit was generated from.
 * @property {QuadletKind} [quadletKind] Quadlet only: the type of that file.
 * @property {number} [mainPid] Main PID while the service runs or starts.
 * @property {number} [memory] Current memory use in bytes, while the service runs.
 * @property {string} [result] systemd Result when it is not success, for example exit-code.
 * @property {string} [triggeredBy] Units that start the service, for example a timer, joined with ", ".
 */

/**
 * List of systemd user services as returned by the services-list action.
 *
 * @typedef {object} ServiceList
 * @property {ServiceItem[]} items The services.
 */

/**
 * State returned by the useServiceDialogs hook: the one open status view and the one open log view.
 *
 * @typedef {object} ServiceDialogsState
 * @property {ServiceItem|null} statusService The service whose status is open, or null.
 * @property {(service: ServiceItem|null) => void} setStatusService Opens the status of a service, or closes it with null.
 * @property {ServiceItem|null} logService The service whose log is open, or null.
 * @property {(service: ServiceItem|null) => void} setLogService Opens the log of a service, or closes it with null.
 */

/**
 * Page state of the Services module: the module page state plus the status and log views.
 *
 * @typedef {import('./module.js').ModulePageState<ServiceItem> & ServiceDialogsState} ServicesPageState
 */

/**
 * Data of the service-view action. found is false when the unit is no longer loaded; text is
 * left out when it is too large, and tooLarge and size are set instead.
 *
 * @typedef {object} ServiceViewResult
 * @property {string} unit Unit name.
 * @property {'unit'|'status'} mode unit for `systemctl --user cat`, status for `systemctl --user status`.
 * @property {boolean} found False when the unit is no longer loaded.
 * @property {string} [text] The text systemctl printed.
 * @property {true} [tooLarge] Set when the text is too large to return.
 * @property {number} [size] Byte size of a text that is too large.
 */

/**
 * Data of the service-logs action: up to the last 100 journal entries of the unit, oldest first.
 *
 * @typedef {object} ServiceLogResult
 * @property {string} unit Unit name.
 * @property {boolean} found False when the unit is no longer loaded; entries are then left out.
 * @property {boolean} [readable] False when the journal cannot be read.
 * @property {'JOURNAL_UNREADABLE'} [error] Set when readable is false.
 * @property {string} [reason] Short reason from journalctl stderr, when readable is false and there is one.
 * @property {import('./journal.js').JournalEntry[]} [entries] The entries.
 */

/**
 * Data of the quadlet-view action: the Quadlet file a loaded service was generated from. found is
 * false when the unit is no longer loaded. quadlet is false, with error NOT_QUADLET, for a plain
 * unit. A file error keeps name, path and kind but has no text. A file that is too large has
 * tooLarge and size instead of text.
 *
 * @typedef {object} QuadletViewResult
 * @property {string} unit Unit name.
 * @property {boolean} found False when the unit is no longer loaded.
 * @property {boolean} [quadlet] True when the unit was generated from a Quadlet file.
 * @property {'NOT_QUADLET'|'FILE_NOT_FOUND'|'OUTSIDE_QUADLET_DIR'|'FILE_UNREADABLE'} [error] Why no text is shown.
 * @property {string} [name] File name, for example web.container; also the download name.
 * @property {string} [path] Full path of the file, from the unit's SourcePath.
 * @property {QuadletKind} [kind] Quadlet file type.
 * @property {string} [text] The file content.
 * @property {true} [tooLarge] Set when the file is too large to return.
 * @property {number} [size] Byte size of a file that is too large.
 */

/**
 * Which file the unit view shows: the Quadlet source or the generated unit.
 *
 * @typedef {'quadlet'|'unit'} UnitViewKey
 */

/**
 * The open unit view: one systemd user service, with its Quadlet file when it has one.
 *
 * @typedef {object} UnitView
 * @property {string} unit Unit name, for example web.service; also the title.
 * @property {UnitViewKey} initial The view that opens first.
 * @property {boolean} hasQuadlet True when the unit comes from a Quadlet file, so both views can be switched.
 * @property {string} [unitPath] Path of the unit file, when already known, until the unit view loads.
 * @property {string} [quadletPath] Path of the Quadlet file, when already known, until the Quadlet view loads.
 */

/**
 * State returned by the useUnitView hook.
 *
 * @typedef {object} UnitViewState
 * @property {UnitView|null} unitView The open unit view, or null.
 * @property {(view: UnitView) => void} openUnitView Opens a unit view, replacing the open one.
 * @property {(item: import('./resource.js').ResourceItem) => (import('./card.js').MenuItem|import('./card.js').MenuDivider)[]} quadletActions Builds a divider and Show Quadlet for a Quadlet resource card, or nothing.
 * @property {() => void} closeUnitView Closes the unit view.
 */

export {};
