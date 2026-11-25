# modules

One folder per MainBoard module, such as `overview/OverviewPage.jsx`. A module keeps its own
sub-components in its folder. `index.js` lists the modules in display order: Overview, Drop Quadlet, Health,
Containers, Volumes, Networks, Images, Secrets, Services, Quadlets. Overview, Drop Quadlet and Health are icon-only tabs.
Each entry also names the handler actions it `requires` (the tab is hidden without them), its `optional`
feature actions and whether it shows the header Refresh (`refresh`); see docs/coding.md, Tabs and capabilities.

Each module page gets `mode` ("admin" or "podshift") as a prop.

Containers, Volumes, Networks, Images, Secrets, Services and Quadlets are BaseModule modules (`BaseModule.jsx`): `XModule.jsx` holds
`class XModule extends BaseModule` and its shared instance, for example `imagesModule`, and `XPage.jsx` only calls
`useModulePage(module, props)` (`../hooks/useModulePage.js`) and `module.render(state)`. Methods are static unless they
read the module settings or are overridden per module. BaseModule is generic in JSDoc over its item type: a subclass
names it with `@augments {BaseModule<SecretItem>}` (the ESLint name of `@extends`), so its instance methods such as
`card(item, state)` take that type. The type only needs the `ModuleItem` fields (id, title, subtitle, source), so
`ServiceItem` fits as well as `ResourceItem`. `render(state)` outputs `dialogs(state)`: by default the Inspect view
modal and, unless `quadletView` is off, the unit view. Refresh in a not-found notice calls `closeAndRefresh(state)`,
which closes the Inspect and unit views and loads the list again. A module with other views overrides both: Services
returns the unit, status and log dialogs (no Inspect), and closes its status and log views before
`super.closeAndRefresh(state)`. Services keeps those two views in `../hooks/useServiceDialogs.js`, which
`ServicesPage` merges into the `useModulePage` state (`ServicesPageState`).

Uninstall is shared: `QuadletUninstall` (`../utils/QuadletUninstall.js`) turns a Quadlets card (file name and app) or the
`quadlet` field of a container, volume or network into a target `{name, isApp, file}`, where `name` is what
`quadlet-remove` takes (the app for a file in an app). `BaseModule.uninstallItems(target, state)` adds a divider and
Uninstall when `state.canUse('quadlet-remove')`; `cardActions` adds them for resources, and the Quadlets module for
its cards. `uninstallDialog(state)` renders `QuadletUninstallModal` (`../components/modals/`), and `useModulePage`
holds the open target, the queued notice and the reload after a removal is queued. `UninstallGuard`
(`../utils/UninstallGuard.js`) keeps Uninstall of a queued target disabled for 60 seconds, shared by all tabs.

The toolbar toggle filters are pluggable: each module passes one filter, or several that all apply, as `filter` in its settings, and the
`FilterToggle` component (`../components/resource/FilterToggle.jsx`) renders each one's options, aria label and button ids
(the filter's `idPrefix` plus the option id). The filters are in `filters/`: `BaseFilter.js` holds the id prefix, the
aria label and the default option (`all`), and `matches(item, value)` lets every item pass All and asks
`matchesOption(item, value)` otherwise; a subclass overrides `options()` and `matchesOption()`. `SourceFilter.js` is
All plus the module's sources by `item.source` (aria label Source, ids such as `podshift-container-source-quadlet`);
`UsageFilter.js` is All / In use / Unused by `item.inUse` (aria label Usage, ids `podshift-secret-usage-...`);
`StateFilter.js` is All / Active / Inactive / Failed by the systemd active state (aria label State, ids
`podshift-service-state-...`), and its static `stateGroup(item)` also gives the Services card tone; `QuadletStatusFilter.js` is All / Active / Inactive / Failed by the status `podman quadlet ls` reports (aria label State, ids `podshift-quadlet-state-...`), and its static `statusGroup(item)` also gives the Quadlets card tone; `QuadletTypeFilter.js` is All / Container / Pod / Volume / Network / Kube / Image by the file suffix (aria label Type, ids `podshift-quadlet-type-...`). The
selected options are `filterValues` in the page state, in the same order as the module filters. Secrets and Quadlets set `quadletView: false`, so their pages have no unit view
and their cards no Show Quadlet item.

The resource modules (Containers, Volumes, Networks, Images, Secrets) load their cards with `useAction`
from the matching list action, for example `containers-list`, and reload on the header refresh.

The Secrets module uses the same cards and toolbar. Secrets have no source (they are not created by
Quadlet or systemd), so the cards have no source label and the toolbar filter is All / In use /
Unused, by `inUse` (a stopped container counts as in use). The rows are Driver, Created, Updated
and Used by; Used by is built from `usedBy` (container plus file path or env variable name), so
its words are translated. Secret values are never loaded: `secrets-list` and the `secret` kind of
the inspect action never return them.

The Services module (`services/ServicesModule.jsx`) loads its cards from `services-list` through `useModulePage` (types in
`../types/service.js` and `../types/journal.js`), with a spinner, an error alert, an empty state and the header Refresh.
Like the other list modules it needs admin access, since the handler only runs as root; the podshift user sees "Requires
administrative access". It shows the podshift user's systemd user services, as `systemctl --user list-units --type=service --all` lists them
without units that are not found (the same set as the overview Services count). The cards use the
unit name as the title and the description as the subtitle. The status label uses the words of
Cockpit's Services page: Running, Active (for example a oneshot that exited), Starting, Not running
or Failed to start. The source label is Quadlet for units generated from a `.container`, `.pod`,
`.kube`, `.network`, `.volume`, `.image` or `.build` file, and Unit for plain unit files. The rows are Active (state and
since), Sub state, Unit file (state and preset), Generated from (the Quadlet file) or Path (the unit
file), then Triggered by, Result, Main PID and Memory (in bytes, shown with `cockpit.format_bytes`) when they apply. The toolbar filter is All /
Active / Inactive / Failed; Active also covers starting and stopping units. The menu has Copy, Show
Quadlet (Quadlet services only), Show Unit and Show status, then a divider, Show log and Open log. Show Quadlet and Show
unit open the same unit view on the Quadlet or the Unit view (see below). Show status (as `systemctl --user status`
shows it, with recent log lines) is loaded from `service-view` in `components/modals/ServiceStatusModal.jsx` on top of
`CodeViewModal`, with a notice when the unit is gone ("This $0 no longer exists." with Refresh, which closes the view
and reloads the list) or the text is too large. Show log
(`components/modals/ServiceLogModal.jsx`) shows the last 100 journal entries of the unit from
`service-logs` in `journalctl -o short-iso` style, newest at the bottom, colored by
priority with `../utils/JournalText.js` (error for 0 to 3, warning for 4, bold for notice); its footer
has Copy, Refresh (loads the log again) and Open log. It shows a plain "No log entries" empty state
when there are none (as Cockpit does; Copy is then disabled), a warning with the handler's reason only when the journal
cannot be read for lack of permission (`JOURNAL_UNREADABLE`), and the same not-found notice
when the unit is gone. The views load through `../hooks/useActionResult.js` only while open. Open log jumps to Cockpit's Logs page with
`/system/logs#/?priority=info&user-service=<unit>&_UID=300`, built in `../utils/CockpitLinks.js`, and is only shown
to admins. There is no link to Cockpit's Services page: its User section reads the signed-in user's own user manager,
so it cannot find the podshift user's Quadlet units or shows the admin's own unit of the same name. There are no start
or stop actions yet. Tone: danger when failed,
success when active or starting, else neutral.

The Quadlets module (`quadlets/QuadletsModule.jsx`) shows the Quadlets `podman quadlet ls` lists, as resource cards, with a spinner, an error alert, an empty state and the header Refresh. Like the other list modules it needs admin access; the podshift user sees "Requires administrative access". The `quadlets-list` action returns already-mapped items (`id`, `title`, `type`, `unitName`, `path`, `status`, `app`, `pod`). The cards use the Quadlet file name without its type suffix as the title (for example `shop-api` from `shop-api.container`) and the type (from the suffix: Container, Pod, Volume, Network, Kube, Image or Build) as the subtitle. The card icon follows the type: the same icon as the Containers, Volumes, Networks and Images cards for those types (`../utils/ResourceIcons.js`), Cubes for Pod, FileCode for Kube, and the Quadlet FileCode icon when the type is unknown. The text filter still matches the full file name. The status label uses the same words as the Services cards where they overlap: Running, Not running, Failed to start, Starting, Stopping, or Active, plus Not loaded and Loaded template for the Podman statuses. The rows are Unit, Pod and Application, each only when set; the path stays off the card, but the text filter still matches it. The toolbar has two filters that both apply: State (All / Active / Inactive / Failed; Active also covers starting and stopping units) and Type (All / Container / Pod / Volume / Network / Kube / Image). The menu has Copy, Show Quadlet and Show Unit. Show Quadlet and Show Unit open the same unit view on the Quadlet or the Unit view, and are hidden when the Quadlet has no service unit. Tone: danger when failed, success when active or starting, else neutral. Types are in `../types/quadlet.js`.

Every resource card has an Inspect menu item after Copy, and Containers cards also have Variables and Commands. Commands is always shown regardless of state; it opens `CommandsModal` (`../components/modals/CommandsModal.jsx`) via `../hooks/useContainerCommands.js` with ready-to-copy Terminal, Logs, Processes and System info commands from `../utils/commandCatalogue.js`, prefixed with `sudo -u podshift -i ` in admin mode. Copy copies the same page as Markdown; Download saves it as `commands-<name>.md` through a cockpit-ws external channel, like Inspect. Inspect and Variables open a code view
with real data from the `inspect` action, through `useResourceView` and `ResourceViewModal`. Containers pass the full
ID, Images the full image ID (`fullId`; the card still shows and copies the 12-character `id`), Volumes and Networks
the name. The title uses the name, or the short ID when there is none
(`../utils/resourceName.js`). Each module page passes its list `refresh` from `useAction` as `onRefresh`, used when the
resource no longer exists. Only one view is open per module. Secrets pass the full secret ID.

Each card gets a status tone from `../utils/ResourceTone.js`. Containers: danger when exited with a non-zero code,
unhealthy, with a failed systemd unit or with auto-update set but without effect; success when running; else neutral
(paused, created, exited 0). Images, Volumes and Networks: danger with a failed systemd unit; success when in use or
used by a running container; else neutral (unused, built-in). Secrets: success when in use, else neutral.

The unit view (`../components/modals/UnitViewModal.jsx`, through `../hooks/useUnitView.js`) shows the Quadlet file of a
service and the unit Quadlet generated from it in one dialog, both with INI colors. Show Unit on the Services module opens
the Unit view (the unit as `systemctl --user cat` shows it, from `service-view`). Show Quadlet opens the Quadlet view
(the file from `quadlet-view`, read from the unit's `SourcePath` inside the PodShift Quadlet folder). Show Quadlet is on
Services cards with the Quadlet source and on Containers, Volumes, Networks and Images cards with the Quadlet source and
a `.service` unit in their Systemd group, after a divider below Inspect (and Variables). With a Quadlet file the title row
starts with two clickable labels, Quadlet then Unit (the icons of the Quadlet and Unit source labels): the shown view is
filled blue, the other outlined, and each is a pressed toggle button. A plain unit shows one Unit label that is not
clickable. The unit name follows the labels and ends in "…" when it does not fit; the path line under it follows the
view and is cut at its start, so the file name stays visible. Both show the full text on hover. Each view is loaded the
first time it is shown and kept while the dialog is open. Notices: the unit is gone ("This $0 no longer exists." with
Refresh), the unit was not generated from a Quadlet file, the Quadlet file no longer exists, is not in the PodShift
Quadlet folder or cannot be read, or the text is too large. The footer has Copy, Download and Close, for the view that is
shown; Download offers the file itself as root through a cockpit-ws
external channel, the same method as the Inspect download (`ChannelDownload.downloadFile()` in
`../utils/ChannelDownload.js`; Cockpit's Content Security Policy refuses blob: URLs): the Quadlet file as
`web.container`, or the unit file that `systemctl --user cat` names first as `web.service` (drop-ins are not in it). Show status and Show log stay separate dialogs.
