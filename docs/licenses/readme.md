# Licences

This project is licensed under AGPL-3.0-or-later. The full text is in the root `LICENSE` file.

Two files still contain a substantial share of original LGPL-2.1-or-later code and remain under that licence. The full text is in `LGPL-2.1.txt` in this folder.

| File | Licence | Notes |
|------|---------|-------|
| `build.js` | LGPL-2.1-or-later | Esbuild script from the [Cockpit starter kit](https://github.com/cockpit-project/starter-kit), restructured locally into a single `Builder` class. It now uses esbuild's own watch mode and Node's `util.parseArgs` instead of argparse, reports errors instead of swallowing them, and detects nested packages. The esbuild loading, the plugin set and the runtime module list still follow the original. |
| `src/app/modules/overview/overview.scss` | LGPL-2.1-or-later | Card layout copied from Cockpit 370 `pkg/systemd/overview.scss`. Unused parts of that file were omitted; the rules that remain are the original CSS. |

Other files that began as starter-kit templates (the page shell, entry point, manifest, Makefile, ESLint and Stylelint configs, and `src/po/de.po`) were rewritten or are small boilerplate, and are licensed with the rest of the project under AGPL-3.0-or-later.
