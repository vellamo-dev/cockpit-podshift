# PodShift UI

English | [Suomi](readme.fi.md)

PodShift UI (`cockpit-podshift`) is a [Cockpit](https://cockpit-project.org/) add-on for [PodShift](https://github.com/vellamo-dev/podshift). It adds a PodShift page to Cockpit, where you can see the server's containers, volumes, networks, images, secrets, services and Quadlets.

PodShift is a lightweight container orchestration enabler for small servers: it turns a server into one that sets itself up, keeps itself secure, and updates your apps automatically.

## PodShift does not need the UI

PodShift works fully without the UI. All monitoring and management is done with the `podshift` commands in a terminal.

The UI is optional. It only makes monitoring easier for people who prefer a web interface over the terminal. It needs PodShift installed on the same host, but the `cockpit-podshift` package does not install PodShift for you.

## Install

Install [PodShift](https://github.com/vellamo-dev/podshift) first. Then open **Applications** in Cockpit and install PodShift UI from there. When it is installed, choose **PodShift** in the Cockpit menu.

Other install methods, updates and removal are described in [docs/usage.md](docs/usage.md). A longer overview of the pages and access rules is in [docs/readme.md](docs/readme.md). The security policy is in [security.md](security.md).

## Licence

This project is based on the [Cockpit starter kit](https://github.com/cockpit-project/starter-kit). New project files are licensed under AGPL-3.0-or-later; see `LICENSE`. Two files that still contain a substantial share of original starter-kit or Cockpit code remain under LGPL-2.1-or-later; see [docs/licenses/](docs/licenses/).
