# Scope

What PodShift UI is for, and what it is not. The overall project scope is in [PodShift's scope](https://github.com/vellamo-dev/podshift/blob/main/docs/scope.md); this page adds what is specific to the UI.

## Main goal

PodShift UI shows a PodShift server in Cockpit, so it can be looked at and operated from a browser without the command line.

> **Scope test**: does this make an existing PodShift feature easier to see or use in Cockpit, in a way that feels like part of Cockpit? If not, it's out of scope.

## The two rules

1. **Backend features live in PodShift.** The UI only calls PodShift's Cockpit API (`/opt/podshift/cockpit/api`). It does not run its own logic on the server, change configuration directly or call `podman` or `systemctl` itself. If the UI needs something the API does not offer, the feature is added to PodShift first, then shown in the UI.
2. **It is a Cockpit app.** It follows Cockpit's design style and rules as closely as possible: PatternFly components, Cockpit's layout, colours, spacing and dark mode, Cockpit's login and administrative access, and Cockpit's translation system. When Cockpit already has a good page for something, the UI links to it instead of copying it (for example, system services open in Cockpit's Services page).

## What PodShift UI is

- An optional add-on: PodShift works fully without it. All monitoring and management is done with the `podshift` commands in a terminal; the UI makes monitoring and some maintenance tasks easier for people who prefer a web interface over the terminal. Installing the UI never installs PodShift.
- A view of one server: the server Cockpit is connected to.
- For administrators and the `podshift` user. Others see **No access**.

## What PodShift UI is not

- **A backend**: no server-side scripts, services or configuration of its own.
- **A replacement for Cockpit pages**: no own versions of Cockpit's system, network, storage or logs pages.
- **A general Podman or systemd manager**: it shows what PodShift manages.
- **A multi-server dashboard**: one server at a time, as Cockpit itself works.
- **A standalone web app**: it runs only inside Cockpit.
- **A full management tool**: the UI handles monitoring and some maintenance tasks, such as setting the environment, Drop install and uninstall. Fuller management is planned (see [roadmap.md](roadmap.md)).

## Principles

1. **Same behaviour as the CLI**: the UI shows the same data and enforces the same access rules as the `podshift` commands, because both use the same backend.
2. **Human experience first**: clear, friendly and consistent with the rest of Cockpit.
3. **Keep it light**: React and PatternFly as Cockpit uses them, and no extra dependencies without a good reason.
4. **Translatable**: every user-visible string goes through `i18n()` (see [translations.md](translations.md)).

## Limitations

- Requires Cockpit 137 or later.
- Fedora only, as PodShift is.
- `cockpit-podshift.spec` stays minimal: it copies the built `dist/` and the metainfo, and nothing else.
