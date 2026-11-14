# Forking

PodShift UI is free and open source, and forking is allowed. The rules are the same as for [PodShift](https://github.com/vellamo-dev/podshift/blob/main/docs/forking.md): a fork is its own project, with its own name, distribution and support, and it must never present itself as PodShift UI.

## What a fork must do

- **Rebrand.** Change the name, package name, Copr project and documentation, so users cannot mistake the fork for the original.
- **Keep the licences.** New files are AGPL-3.0-or-later, and two files remain LGPL-2.1-or-later (see [licenses/](licenses/)). Keep the copyright and licence notices and state what you changed.
- **Distribute independently.** Build and publish your own RPM under your own Copr project. Don't reuse `vellamo/cockpit-podshift` or the `cockpit-podshift` package name.
- **Support itself.** Point your users to your own issue tracker.

## What to rename

| Where | What |
|---|---|
| `package.json` | `name` (also used as the Cockpit folder name under `/usr/share/cockpit/`), `description`, `author`. |
| `cockpit-podshift.spec` | Rename the file, then `Name`, `URL`, `Source0`, the hard-coded `cockpit/podshift` install paths, the metainfo file name and the changelog. |
| `fyi.vellamo.cockpit_podshift.metainfo.xml` | Rename the file and change its `id`, name, summary and `<launchable>` (it must match the Cockpit folder name). Update `APPSTREAMFILE` in the `Makefile` to match. |
| `src/app/manifest.json` | The menu label shown in Cockpit. |
| `src/po/` | Regenerate the `.pot` files after renaming (see [translations.md](translations.md)). |
| `readme.md` and `docs/` | Names, links, install commands and support channels. |

The Cockpit Applications entry is shipped by the PodShift package, not by this project, so a fork has to provide its own entry, or be installed from a terminal.

## Working with PodShift

The UI depends on the PodShift Cockpit API. A fork that keeps using official PodShift must keep to that API; if it changes the API, it needs its own fork of PodShift too.

## What this project supports

Only what it ships through the `vellamo/cockpit-podshift` Copr repository. Reports that reproduce only on a fork are out of scope and will be closed.
