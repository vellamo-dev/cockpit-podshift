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

## Managing

Change the server from Cockpit. Not planned before autumn 2027. Each action is added to PodShift's API first.

| Status | Name | Description |
|:---:|---|---|
| 📋 | Services | Start, stop and restart services. |
| 📋 | Quadlets | Add and remove Quadlets. |
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
