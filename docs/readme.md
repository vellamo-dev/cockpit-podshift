# PodShift UI documentation

PodShift UI is the Cockpit page for a [PodShift](https://github.com/vellamo-dev/podshift) server. It needs [Cockpit](https://cockpit-project.org/) 137 or later and PodShift on the same host, but installing it does not install PodShift.

PodShift does not need the UI. All monitoring and management is done with the `podshift` commands in a terminal. The UI makes monitoring and some maintenance tasks easier for people who prefer a web interface over the terminal.

The app talks to PodShift's Cockpit API on the server, under `/opt/podshift/cockpit/api` (the handler is `/opt/podshift/cockpit/api/main.sh`). How to install, update and remove the package is in [usage.md](usage.md).

## Pages

The menu entry is **PodShift**. These tabs appear, in this order. A tab is shown only when the installed PodShift offers the handler actions it needs (from the `capabilities` action). While that list loads for the first time, a spinner stands in for the tabs and no page is shown. If it cannot be read, every tab is shown, with a warning under the tabs. A feature such as Inspect or Show log is hidden when PodShift lacks its action.

| Tab | What it shows |
|---|---|
| Overview | Status, Usage, Info, Configuration and Health cards. When the environment tag (`TSV_ENV`) is not set, an administrator sees a warning under the tabs. The Configuration card can add, edit and remove custom `TSV_*` variables, and set the environment tag once. |
| Drop Quadlet | A drop zone that installs one Quadlet file or .zip bundle, with the drop history and the install log. Hidden until PodShift offers `quadlet-drop`. |
| Health | The full health check report, grouped. |
| Containers | Podman containers as cards, with a text filter and a source switch. Each card has Commands in its menu for ready-to-copy terminal commands, which can be copied or downloaded as Markdown, and a container made by an installed Quadlet file has Uninstall. |
| Volumes | Podman volumes as cards, with a text filter and a source switch. A volume made by an installed `.volume` file has Uninstall in its menu. |
| Networks | Podman networks as cards, with a text filter and a source switch. A network made by an installed `.network` file has Uninstall in its menu. |
| Images | Podman images as cards, with a text filter and a source switch. |
| Secrets | Podman secrets as cards, with a text filter and a usage switch. |
| Services | The systemd user services of the `podshift` user, with a text filter and a state switch. You can also open a unit's status and logs. |
| Quadlets | Podman Quadlets as cards, with a text filter and state and type switches. A card shows the unit description when the Quadlet file has one. Every card has Uninstall in its menu. |

## Uninstall

Uninstall is in the card menu on the Quadlets tab, and on a container, volume or network that an installed Quadlet file made (PodShift 0.25.3 or later reports which file). It is shown only when PodShift offers the `quadlet-remove` action. It always removes a whole installed Quadlet file, or the whole app (bundle) when the file is part of one, so the confirm dialogue names what goes: for example **Uninstall boy.container** when opened on the container `boy`, or **Uninstall app shop** with a note that `db.container` is part of the app. PodShift stops the units, removes the files and leftover containers, pods and networks, and keeps images. Volumes are kept unless **Also delete volume data** is ticked; the option is shown for an app and a `.volume` file, is never ticked at first, and deletes the volumes and their data for good. The removal is queued: the tab shows a notice, loads its list again at once and after 5 seconds, and the install log on the Drop Quadlet tab shows the progress. Uninstall of the same file or app stays disabled for 60 seconds after it is queued, so it cannot be queued twice while PodShift still runs it. A refusal, for example when another Quadlet still uses the file, is shown in the dialogue.

## Configuration card

The Configuration card needs PodShift 0.22.0 or later and Cockpit administrative access. It lists `TSV_ENV`, the `TSV_NW*` network values and the custom `TSV_*` variables from the podshift user's `tsv.conf`.

- **Add variable** in the card's menu opens a modal with a fixed `TSV_` before the name. The name is changed to capital letters, and a typed or pasted `TSV_` at the start is removed.
- A custom variable's value is a link. It opens the same modal to change the value or remove the variable. The name cannot be changed. Remove asks for confirmation in the same modal.
- The modal warns not to store passwords, tokens or other secrets, because values are kept in plain text in `tsv.conf`. Use Podman secrets for those.
- The modal checks the name and value with the same rules as `podshift config`, and Save stays disabled while a rule fails. Reserved names (`TSV_NW*`, `TSV_ENV*`), secret words in the name and known token formats in the value are refused. PodShift checks again when saving, and shows its own message if it refuses.
- `TSV_NW*` rows are read-only.
- While `TSV_ENV` is not set, its **Not set** value opens a modal to set it, with the suggested tags from PodShift. Once set, it is read-only here; change it as root with `sudo podshift env --set <tag>`.

The card reloads after each change. Running Quadlets keep their values until they are installed again.

## Access

The UI first checks that the PodShift handler is present, then who you are.

- If the handler is missing, the page says **PodShift is not installed**.
- If you are not an administrator and not the `podshift` user, it says **No access**, and asks you to log in as the `podshift` user or turn on Cockpit administrative access.
- An administrator gets the main page and its tabs.
- The `podshift` user without administrative access sees **Requires administrative access**, with a request to turn on Cockpit administrative access, instead of the tabs. Every view loads data as root, so it needs that access.

Some actions change the system through PodShift API actions; see [security.md](../security.md).

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
