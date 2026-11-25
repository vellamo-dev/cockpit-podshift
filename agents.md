# agents.md

PodShift UI (`cockpit-podshift`) is an optional Cockpit page for a [PodShift](https://github.com/vellamo-dev/podshift) server. It is a React 18 and PatternFly 6 app in plain JS/JSX, built into `dist/`.

- What it is and its pages: [docs/readme.md](docs/readme.md)
- What is done and planned: [docs/roadmap.md](docs/roadmap.md)

## Purpose first

AI can draw on almost all the world's knowledge, but people still have limited time, money and attention. It's easy to end up with checks, reviews and solutions that are thorough on paper but no longer serve their purpose, are fair to the people they affect, work well in practice, or fit the goal to the resources at hand.

So:

- PodShift is built for people first. If a change doesn't make it better for the people who use or maintain it, don't make it.
- The guardrails in this file are rules, not suggestions. Follow them even when breaking one looks faster.
- Don't report something as verified unless you ran it. A check that passes but doesn't prove the real behaviour is a false validation.
- Do what was asked. Extra features, polishing and refactoring nobody asked for are creep. Propose them instead.

The wider thinking is in PodShift's [design choices](https://github.com/vellamo-dev/podshift/blob/main/docs/design-choices.md).

## Scope

Read [docs/scope.md](docs/scope.md). In short:

- **No backend features.** The UI only calls PodShift's Cockpit API (`/opt/podshift/cockpit/api`), which lives in the podshift repository. It never runs `podman` or `systemctl` itself. A missing action is added to PodShift first.
- **It is a Cockpit app.** Follow Cockpit's look and PatternFly components. Link to Cockpit's own pages instead of copying them.

## Layout

See [Project layout](docs/coding.md#project-layout). Sources are in `src/app/`, translations in `src/po/`, the build container in `src/dev/`.

## Build and lint

```sh
./src/dev/run make              # build dist/ in the container
npm run build                   # same: starts the container
npm run rebuild                 # force a build even when nothing changed
npm run watch                   # rebuild dist/ on every save, in the container
./src/dev/run npm run eslint
./src/dev/run npm run stylelint
npm test                        # unit tests in src/test/unit/, in the container
npm run updateTranslations      # refresh src/po/podshift.pot and merge it into every .po (uses the container)
```

Details: [Building](docs/coding.md#building).

## Test on a VM

The `package.json` scripts call `../podshift/test`, for example `npm run runPodShiftVM` or `npm run syncUIinVM`. The full list is in [Testing on a VM](docs/coding.md#testing-on-a-vm). Do not start, change or reset a VM without an explicit go.

## Code style

Full rules: [Coding style](docs/coding.md#coding-style) and [JSDoc](docs/coding.md#documentation-jsdoc). ESLint matches WebStorm defaults:

- No spaces inside braces: `{a}`, `import {Foo} from '...'`.
- Self-closing tags without a space: `<Icon/>`.
- Braces always, also for one-line `if` bodies.
- Empty catch: `.catch(() => {})`.
- Function declarations, not arrow functions stored in variables. 4-space indent.
- Every visible string goes through `i18n("...")` with a literal string. See [translations.md](docs/translations.md).
- JSDoc on every file and function. Shared shapes are `@typedef`s in `src/app/types/`.
- A JSX comment between props is a bare `/* ... */`, not `{/* ... */}`.
- British English in comments and docs. No em dashes.

## Rules

- No new dependencies without asking.
- All builds run in the container. Do not run `./build.js` on the host; use `npm run build` or `./src/dev/run make`.
- `dist/` is committed and installed by the RPM. Rebuild it after source changes.
- Temporary files go in [artifacts/work/](artifacts/readme.md), one subdirectory per task.
- Never print `.env` or any secret value.
- Change only what the task needs. Docs state only verified facts.
- Only the root readme has a Finnish version, `readme.fi.md`. Update it whenever `readme.md` changes. No other files are translated.
- Bump the version as the last step of a change, and say so in your report. See [Versioning](docs/coding.md#versioning).
- Keep 3 entries in the spec `%changelog`, newest first; move older ones to the top of `changelog.md`. See [Versioning](docs/coding.md#versioning).
