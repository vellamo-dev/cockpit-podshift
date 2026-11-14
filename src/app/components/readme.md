# components

Reusable UI parts for the PodShift Cockpit app, grouped by role.

## layout/

`MainBoard.jsx` is the tabbed main page. The modules themselves live in `../modules/`.
`TabPlaceholder.jsx` is the stand-in page for tabs that are not built yet (Services, Quadlets).

## status/

The first screen is one of `Loading.jsx`, `NotInstalled.jsx` or `NoAccess.jsx`, until access is known
and the app can show MainBoard.

## resource/

`ResourceGrid` and `ResourceCard` are used by the Containers, Images, Volumes, Networks and Secrets tabs. ResourceGrid shows as many
columns of at least 28rem as fit in its own width, at most 3 (`../hooks/useColumnCount.js`), and deals the cards to
them in turn so reading order stays row by row. ResourceCard keeps its kebab menu in the top-right corner on every width: the header
does not wrap (overriding Cockpit's wrapping card headers). The header has three lines: icon, name and kebab; the short ID;
then the labels (Running icon, status, source, auto-update icon) on their own line, aligned with the name.
The `tone` prop colors the corner tint: neutral (text color, 9%), success or danger (PatternFly status colors at
`--podshift-resource-card--tone-strength`, 18%; the brighter hover status tokens in the dark theme).
A row can set `mono` to show its value in a monospace font, for example the container command.

`CardActionsMenu.jsx` is the kebab menu used on resource cards, the Overview PropertiesCard, and the Health views. An item `{ key, divider: true }` (`MenuDivider` in `../types/card.js`) shows a separator line.
`OpenInPodmanButton.jsx` links to the Cockpit Podman page for the podshift user. Whether that page is installed is
checked by `../utils/isPodmanPageInstalled.js`.

## modals/

`CodeViewModal` is a large modal with colored code, Copy (reads "Copied" for 2 seconds, `../hooks/useCopiedFlag.js`) and Close, a spinner while loading and an inline alert on error. `actions` are extra footer buttons before Copy, `endActions` after Copy and before Close. `header` replaces the title and the note with custom header content, which must contain the `podshift-code-view-title` element.
`InspectModal` uses it for podman inspect JSON of any resource kind (`../utils/highlightJson.js`), and `VariablesModal`
for a container's NAME=value variables (`../utils/highlightIni.js`), with secrets masked until "Show secrets"
(`../utils/EnvVariables.js`). `ResourceViewModal` shows the open one of the two for a tab, with data from the
`inspect` action; Variables come from `Config.Env` of the same inspect object. InspectModal has Download, which saves
`<kind>-<name>-inspect.json` (`../utils/resourceName.js`), always through file mode and `InspectResource.downloadInspect()`.
The Secrets tab uses `ResourceViewModal` with kind `secret`, like the other resource tabs; the inspect action never returns the secret value. `InspectNotice` replaces the code in both views: "This $0 no longer exists." with Refresh, which closes the view and
reloads the tab, or "The inspect output is too large to show here ($0)." with the `podman <kind> inspect <ref>` command.
`UnitViewModal` shows the Quadlet file and the generated unit of one systemd user service on top of `CodeViewModal`,
with `UnitViewHeader` as its header: the Quadlet and Unit view labels (clickable toggles when there is a Quadlet file),
the unit name with an ellipsis, and the path line of the shown file, cut at its start. Each view loads on first show from
`quadlet-view` or `service-view` (`unit` mode) and stays cached while open; Copy and Download act on the shown view;
Download reads the file as root through `ChannelDownload.downloadFile()` (`../utils/ChannelDownload.js`), like Inspect. See `../modules/readme.md` for where it opens.

## common/

`HealthStatusIcon.jsx` is the status icon for a health-check state. It is used by both the Health tab and the
Overview Health card, so it stays here rather than in a single tab folder.

`PropertiesCard.jsx` lives with the Overview module (`../modules/overview/PropertiesCard.jsx`), which is its only user.