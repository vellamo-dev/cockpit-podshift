# Roadmap

What PodShift UI does today and what is planned. Details may change. Backend features come first in [PodShift](https://github.com/vellamo-dev/podshift/blob/main/docs/roadmap.md); see [scope.md](scope.md).

| Icon | Status |
|:---:|---|
| ✅ | Ready |
| 🚧 | In progress |
| 📋 | Planned |
| ❌ | Rejected |

## Monitoring

See the state of a PodShift server in Cockpit.

| Status | Name | Description |
|:---:|---|---|
| ✅ | Overview | Status, Usage, Info, Configuration and Health cards, and a warning when the environment is not set. |
| ✅ | Health report | The full health check report, grouped. |
| ✅ | Containers, Volumes, Networks, Images, Secrets | Cards with search and switches, with inspect, copy and download. |
| ✅ | Services | The `podshift` user's services, with unit status and logs. |
| ✅ | Quadlets | Quadlet cards with state, type and description. |
| ✅ | Cockpit links | System services and other items open in Cockpit's own pages. |
| ✅ | Capabilities | Tabs and single features follow the actions the installed PodShift offers. |
| ✅ | Auto refresh | Overview and Drop Quadlet refresh on their own for 4 minutes after the tab opens or Refresh is clicked; a header toggle turns it on or off (0.18.0). |

## Managing

Change the server from Cockpit. Not planned before autumn 2027. Each action is added to PodShift's API first.

| Status | Name | Description |
|:---:|---|---|
| 📋 | Services | Start, stop and restart services. |
| 📋 | Quadlets | Add and remove Quadlets. |
| ✅ | Drop Quadlet | The drop-quadlet tab uploads one Quadlet file or .zip bundle with `quadlet-drop` and shows the drop history (`quadlet-drop-history`) and the install log (`quadlet-install-log`), needing PodShift 0.23.0 (0.14.0). The Drop History shows the 0.24.0 statuses unchanged, removing and removed (0.15.0). The remove dialog is prepared for the Quadlets tab (`quadlet-remove`, volumes kept unless chosen). The history and log refresh only while the page is visible (0.15.2). Each card polls at the faster of two schedules: after the tab opens or Refresh, from every second down to every 5 s (history) or 15 s (log); after a drop, here or in a terminal, from every 300 ms to every 2 s for 2 minutes. While an item is in progress both poll at least every second and the auto refresh countdown waits (0.18.0). The install log menu shows newest or oldest first, newest by default, kept in localStorage (0.15.3). With PodShift 0.25.0 the Drop History has one row per drop ID; Uploaded, Removing and Removed are gone and removals show only in the install log (0.16.0). The install log menu copies the shown lines, and the drop zone is locked for up to 5 seconds after a drop (0.17.1). It stays hidden until PodShift offers `quadlet-drop`; the history and log cards are hidden without their actions. |
| 📋 | Environment | Set the environment tag. |
| 📋 | Variables and secrets | Manage `TSV_*` variables and secrets. |

## Project

| Status | Name | Description |
|:---:|---|---|
| ✅ | Install from Cockpit | Listed in Cockpit Applications. |
| ✅ | RPM via Copr | `vellamo/cockpit-podshift`. |
| ✅ | Access checks | Administrators and the `podshift` user only. |
| ✅ | Translations | Cockpit's translation system (see [translations.md](translations.md)). |
| ✅ | Documentation | Readme, usage, scope, support, forking, coding, translations and this roadmap. |
