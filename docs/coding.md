# Coding and development

The PodShift UI code follows a small set of consistent conventions. The code itself is the primary documentation. This file also covers the project layout, how to build the UI, and how to try it on a VM. A short checklist for AI agents and automation is in [agents.md](../agents.md).

## Project layout

This repository is meant to sit next to [PodShift](https://github.com/vellamo-dev/podshift):

```
vellamo/
├── podshift/
└── cockpit-podshift/
```

```
cockpit-podshift/
├── Makefile, build.js, package.json, package-lock.json, …  # build tooling; sources are in src/app/
├── cockpit-podshift.spec                                   # RPM: installs dist/ into /usr/share/cockpit/podshift
├── fyi.vellamo.cockpit_podshift.metainfo.xml
├── docs/                                                   # documentation
├── src/
│   ├── app/            # the Cockpit app, built into dist/ (React 18.3.1, PatternFly 6.6)
│   │   ├── api/        # all calls to the PodShift Cockpit API
│   │   ├── components/ # UI parts (layout, status, resource, modals, common)
│   │   ├── hooks/
│   │   ├── modules/    # one folder per tab
│   │   ├── types/
│   │   └── utils/
│   ├── po/             # translations (for example de.po); templates are generated
│   ├── test/unit/      # QUnit unit tests for pure helpers in src/app/utils/
│   └── dev/            # build container wrapper (run) and Containerfile
├── readme.md, LICENSE, docs/licenses/
├── dist/               # built app, committed so the RPM can install it
├── artifacts/          # cockpit-lib/, logs/, rpm/, tmp/, work/; only readme.md is tracked
└── node_modules/       # generated, git-ignored
```

The Makefile fetches Cockpit's `pkg/lib` into `artifacts/cockpit-lib/` from a pinned tarball. `npm run buildRpm` writes the cockpit-podshift RPM to `artifacts/rpm/`. See [artifacts/readme.md](../artifacts/readme.md).

The build adds `"version"` from the spec to `dist/manifest.json`, so anyone can see which version a built `dist/` or an installed UI is, for example with `grep version /usr/share/cockpit/podshift/manifest.json`. The source `src/app/manifest.json` has no version; do not add one by hand.

Licences: the project is AGPL-3.0-or-later (`LICENSE`); `build.js` and the Overview card styles remain LGPL-2.1-or-later (`docs/licenses/`).

## Building

Builds run in a container so the result doesn't depend on the local computer: the same Node, npm and tool versions, and the pinned packages from `package-lock.json`, give the same `dist/` on any machine and in Copr.

The documented way to build and lint is inside the build container, through `./src/dev/run` or the `package.json` scripts that call it. The Makefile and `build.js` refuse to build on the host, with the errors `Build must run in the container: ./src/dev/run make` and `Build must run in the container: npm run build`. Only `clean`, `print-version` and `devel-uninstall` may run on the host, and `build.js -h` still shows the help.

```
./src/dev/run make
./src/dev/run make watch
npm run build
npm run rebuild
npm run watch
./src/dev/run npm run eslint
./src/dev/run npm run stylelint
```

`./src/dev/run` picks a runtime itself: on macOS it uses Apple `container` when that command is on `PATH`, otherwise podman; on Linux it uses podman. Set `COCKPIT_PODSHIFT_RUNTIME` to `container` or `podman` to force one. With no command, it starts an interactive shell. The image is built from `src/dev/container/Containerfile` when it is missing.

The first container build generates `package-lock.json` if it is missing. Commit that file. Later builds use `npm ci` to install the pinned versions into the named volume `cockpit-podshift-node-modules`, mounted at `/src/node_modules`, not into the project tree. After changing `package.json`, refresh the lockfile with `./src/dev/run npm install` and commit it.

Local Node is for the IDE only. You can run `npm install` on the host so `./node_modules` exists for completion. Do not use that tree to build, and do not commit changes to `package-lock.json` from a local install.

`make watch` rebuilds `dist/` on every save.

`package.json` has `npm run build` and `npm run watch`, which start the container (`./src/dev/run make` and `./src/dev/run make watch`). `npm run build` skips the build when nothing changed (`make: Nothing to be done`); `npm run rebuild` forces it. Those scripts fetch `artifacts/cockpit-lib` and run `npm ci` in the volume, the same as calling `./src/dev/run` yourself.

`build.js` can also copy `dist/` to another machine with rsync after each successful build:

- `./build.js --rsync HOST` copies it to `/usr/local/share/cockpit/` on `HOST`.
- Without `--rsync`, setting `RSYNC_DEVEL=HOST` copies it to `~/.local/share/cockpit/` on `HOST`. `./src/dev/run` passes this variable into the container.

For day-to-day work on a VM, the scripts below are the usual path.

Lint scripts in `package.json` (run them in the container, as above): `eslint`, `eslint:fix`, `stylelint` and `stylelint:fix`.

## Unit tests

Pure helpers in `src/app/utils/`, such as `TsvConfigRules` and `ConfigModalView`, have QUnit tests in `src/test/unit/`, one `<Name>.test.js` file per helper. They run under Node in the build container, so a tested helper must not import `cockpit` or React.

Run the unit tests in the container:

```sh
npm test
```

## Testing on a VM

These `package.json` scripts call tests in the sister `../podshift` project. They do not start a VM or container from this repository itself.

| Script | Runs | What it does |
|---|---|---|
| `npm run runPodShiftVM` | `bundle-ui-dev-mount` | Builds and installs PodShift in a fresh VM, then mounts the local `dist/` (when it exists) into Cockpit for live development. The folder is mounted read-only at `/mnt/cockpit-podshift` and bind-mounted at `/usr/local/share/cockpit/podshift`. After a rebuild of `dist/`, refresh the browser. The mount is gone after a reboot. |
| `npm run runPodShiftVMWithExamples` | `bundle-ui-dev-mount-examples` | The same, then adds the example resources so the UI has data to show. |
| `npm run addExamplesToPodShiftVM` | `postinstall-examples` | Adds those example resources to a VM that is already installed. |
| `npm run syncUIinVM` | `postinstall-ui-sync-files` | Copies the current `dist/` over the installed UI in `/usr/share/cockpit/podshift`, adding, replacing and removing files to match. Does nothing when the dev mount is in use, and skips when `dist/` is missing. Reinstalling the UI RPM restores the packaged files. |
| `npm run buildAndSyncUIinVM` | `npm run build`, then `postinstall-ui-sync-files` | Builds `dist/` first, then syncs that result. |
| `npm run buildRpm` | `ui-rpm-build` | Builds the cockpit-podshift RPM in its own Fedora container, the way Copr does, and writes it to `artifacts/rpm/`. Needs a built `dist/` already (including `dist/manifest.json`). |
| `npm run buildAndInstallRpm` | `npm run build`, then `bundle-ui-rpm-install-examples` | Builds `dist/`, then installs PodShift and the UI from RPMs in a fresh VM, and adds the example resources. |

## Coding style

The rules below apply to every `.js` and `.jsx` file under `src/app`. ESLint enforces them: run `./src/dev/run npm run eslint`.

### Readable code

Code is written to be read. Short and clever is not a goal; plain and obvious is.

- React components and hooks are function declarations, usually one per file:

  ```jsx
  export function CardActionsMenu({items = []}) {
      return (
          ...
      );
  }
  ```

- Arrow functions are only for short inline callbacks, such as an `onClick` handler, a `.map()` or `.filter()` callback, or the body of `useEffect`, `useCallback` or `useMemo`.
- No function stored in a variable: no `const Name = (...) => (...)` and no `const name = function () {}`. A helper inside a function is a named inner function declaration.
- Do not use instance classes for components. An api or utils module that holds several related functions may be a class with only static methods, for example `PodShiftApi.callAction()`. A file that holds a static class is named exactly like the class (PascalCase, for example `PodShiftApi.js`).
- Names say what a thing is: `item`, `group`, `row`, `option`. No single-letter names and no bare `_`. A loop index `i` is fine.
- No nested ternaries. Use `if`/`else` or a `switch`, and store the result in a variable.
- No clever one-liners: no chained `&&`/`||` tricks for control flow, no comma expressions, no dense chains that hide what happens.
- Indent with 4 spaces.
- Translations: import `i18n` from `utils/i18n.js` and write `i18n("Text")`. Never `_` and never `cockpit.gettext` directly. xgettext extracts the `i18n` calls (see the Makefile keywords).
- The cockpit object: import it from `utils/cockpitTyped.js`, never from `'cockpit'` directly. That module gives the IDE the types from `artifacts/cockpit-lib/cockpit.d.ts`.
- PatternFly imports use the extensionless `dist/esm` path of one component or icon, for example `'@patternfly/react-core/dist/esm/layouts/Stack'` or `'@patternfly/react-icons/dist/esm/icons/lock-icon'`. No package root imports and no `.js` at the end.

ESLint enforces the function declarations with `func-style: declaration`. The other points are checked in review.

### Exceptions

A rare exception is allowed when the rule makes the code worse, for example a third-party API that needs a function expression. It carries a plain `//` comment right above it that says why. An `eslint-disable` comment is only for a known false positive, and also says why.

## Documentation (JSDoc)

Every file and every function is documented with JSDoc, so a person can read what a file and each function does without running it, and the IDE knows the types. JSDoc replaces descriptive plain comments: a `//` comment is only for a short note inside a body, never to describe a file, a function or a data shape.

ESLint enforces it with `eslint-plugin-jsdoc` (`jsdoc/*` rules in `.eslintrc.json`), in TypeScript mode, so `import('...')` types work.

### Tags

The table lists the tags in the order they are written.

| Tag | Used on | Required | Meaning |
|---|---|---|---|
| **File header** | | | |
| description | file | must | The first text of the block: what the file holds, in one sentence, present tense. |
| `@file` | file | must | File name only, for example `useAction.js`. Never a path. |
| `@license` | file | must | `AGPL-3.0-or-later` |
| `@author` | file | must | `Vellamo.fyi` |
| **Functions** | | | |
| description | function | must | The first text of the block: what the function does, present tense, for example `Loads one handler action.` More lines may follow for the how and why. |
| `@param` | function | one per argument | `@param {type} name Description.` An optional argument is `[name]`. React props are `@param {object} props Component props.`, then one `@param {type} props.x Description.` per prop. |
| `@returns` | function | when it returns a value | `@returns {type} Description.` A component returns `{React.ReactElement}`. A function that returns nothing leaves it out. |
| `@throws` | function | optional | `@throws {type} When it happens.` |
| `@abstract` | method | optional | A base class method that a subclass must override; the base version throws. |
| **Classes** | | | |
| `@template` | class, function, data shape | optional | A type parameter: `@template {ResourceItem} [T=ResourceItem] Item type.` Written before `@param` or `@typedef`. |
| `@augments` | class | optional | The generic base class with its type argument, for example `@augments {BaseModule<SecretItem>}`. ESLint wants this name instead of `@extends`. |
| **Types** | | | |
| `@typedef` | data shape | must | Declares a shared data shape: `@typedef {object} MenuItem`, or a union such as `@typedef {'ok'\|'warn'} HealthState`. |
| `@property` | data shape | one per field | `@property {type} name Description.` An optional field is `[name]`. |
| `@type` | constant, cast | optional | The type of an exported constant, such as `@type {Tab[]}`, or an inline cast: `/** @type {AccessResult} */ (value)`. |

### Writing rules

- A file starts with the SPDX comment, then the JSDoc file header:

  ```js
  /*
   * SPDX-License-Identifier: AGPL-3.0-or-later
   */

  /**
   * Hook that loads one handler action, once or on a poll period.
   *
   * @file useAction.js
   * @license AGPL-3.0-or-later
   * @author Vellamo.fyi
   */
  ```

- Every function declaration has a JSDoc block, exported or not, also a named inner function.
- Descriptions are full sentences, present tense, no em-dashes. The block has one blank ` *` line between the description and the tags.
- Types use TypeScript syntax: `string[]`, `Promise<boolean>`, `'start'|'end'`, `() => void`, `object`.
- Data shapes shared by more than one file, such as a card row, a menu item, a health result or a network item, are declared once with `@typedef` in `src/app/types/`. A file that uses one imports it at the top, after the imports:

  ```js
  /** @typedef {import('../types/card.js').MenuItem} MenuItem */
  ```

- A file in `src/app/types/` holds only typedefs, grouped by topic, and ends with `export {};` so it is a module.
- Only tags listed in the table are used. A new tag gets a table row first.

### Type files

Shared data shapes live in `src/app/types/`, one file per topic (for example `api.js`, `card.js`, `health.js`, `module.js`, `resource.js`, `service.js`). The file name says the topic; each `@typedef` documents its own shape.

### Readme files

- A `readme.md` documents a directory only when the files' purpose or nature cannot be expressed in the files themselves, or to cover a directory's content and purpose.
- Only the root readme has a Finnish version, `readme.fi.md`. Update it whenever `readme.md` changes. No other files are translated.

## ESLint version

The project stays on ESLint 8 (`.eslintrc.json`) on purpose, even though ESLint 8 and the `standard` configs are deprecated. Cockpit, its starter kit and cockpit-podman use the same setup, because the React plugin (`eslint-plugin-react`) does not support ESLint 10 yet. ESLint 9 is end-of-life too, so it is skipped. Once the plugin supports ESLint 10, the project moves straight to ESLint 10 with a flat config (`eslint.config.js`) and `neostandard`, keeping the 4-space indent and the rules above.

## Versioning

Versions are `x.y.z`. The `Version:` line in `cockpit-podshift.spec` is the single source of truth. The Makefile reads it (`make print-version`). `package.json` has no `version` field and the metainfo has no `<release>`; if either is added, it follows the spec.

- **Patch (`z`)** goes up on any change that ships, such as a fix, a text change or a docs edit in the package.
- **Minor (`y`)** goes up when a feature is added or after a bigger refactor, and `z` goes back to 0.
- **Major (`x`)** stays at 0 until the first stable release. Only the maintainer changes it, never an agent.

Every bump adds a spec `%changelog` entry (`- x.y.z-1`) and sets `Release:` back to `1`. Bump once per task or delivery, not per saved file. An agent bumps the version as the last step of a change and says so in its report.
