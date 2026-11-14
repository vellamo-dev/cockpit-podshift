# PodShift UI documentation

PodShift UI is the Cockpit page for a [PodShift](https://github.com/vellamo-dev/podshift) server. It needs [Cockpit](https://cockpit-project.org/) 137 or later and PodShift on the same host, but installing it does not install PodShift.

PodShift does not need the UI. All monitoring and management is done with the `podshift` commands in a terminal. The UI only makes monitoring easier for people who prefer a web interface.

The app talks to PodShift's Cockpit API on the server, under `/opt/podshift/cockpit/api` (the handler is `/opt/podshift/cockpit/api/main.sh`). How to install, update and remove the package is in [usage.md](usage.md).

## Pages

The menu entry is **PodShift**. These tabs appear, in this order:

| Tab | What it shows |
|---|---|
| Overview | Status, Usage, Info, Configuration and Health cards. When the environment tag (`TSV_ENV`) is not set, an administrator sees a warning under the tabs. |
| Health | The full health check report, grouped. |
| Containers | Podman containers as cards, with a text filter and a source switch. |
| Volumes | Podman volumes as cards, with a text filter and a source switch. |
| Networks | Podman networks as cards, with a text filter and a source switch. |
| Images | Podman images as cards, with a text filter and a source switch. |
| Secrets | Podman secrets as cards, with a text filter and a usage switch. |
| Services | The systemd user services of the `podshift` user, with a text filter and a state switch. You can also open a unit's status and logs. |
| Quadlets | Podman Quadlets as cards, with a text filter and state and type switches. A card shows the unit description when the Quadlet file has one. |

## Access

The UI first checks that the PodShift handler is present, then who you are.

- If the handler is missing, the page says **PodShift is not installed**.
- If you are not an administrator and not the `podshift` user, it says **No access**, and asks you to log in as the `podshift` user or turn on Cockpit administrative access.
- An administrator, or the `podshift` user, gets the main page and its tabs.

Loading data requires Cockpit administrative access. The `podshift` user without it sees the page and its tabs, but the Overview cards and the other tabs show **Requires administrative access** instead of data. Turn on administrative access in Cockpit to see them.

## Documents

| Document | What it covers |
|---|---|
| [coding.md](coding.md) | Project layout, how to build the UI, how to try it on a VM, and the coding style. |
| [translations.md](translations.md) | How translations in `src/po/` are made, updated and built. |
| [usage.md](usage.md) | How to install and use the UI day to day. |
| [scope.md](scope.md) | What the UI does and does not do. |
| [security.md](../security.md) | The security policy and how to report a problem. |
| [support.md](support.md) | Where to report issues. |
| [forking.md](forking.md) | What to rename and change in a fork. |
| [roadmap.md](roadmap.md) | What is done and what is planned. |
| [licenses/](licenses/) | The AGPL-3.0-or-later project licence, and the two files that remain under LGPL-2.1-or-later. |
