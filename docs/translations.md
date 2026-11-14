# Translations

PodShift UI is written in English. Translations live in `src/po/`.

## Files in `src/po/`

| File | What it is | Edit by hand? |
|---|---|---|
| `<lang>.po` (for example `de.po`) | One translation per language | Yes |
| `podshift.pot` | Template with every translatable string | No, generated |
| `podshift.js.pot`, `podshift.html.pot`, `podshift.manifest.pot`, `podshift.metainfo.pot` | Parts of the template, merged into `podshift.pot` | No, generated |

`de.po` (German) is only partly translated and serves as an example.

## Marking strings in the code

Wrap every user-facing text in `i18n()` with a literal string:

```js
i18n("Not running")
```

A variable or a built-up string inside `i18n()` cannot be found by the extractor, so it stays in English.

## Refreshing the template

To refresh the template and merge the new strings into every `.po` file in one step:

```sh
npm run updateTranslations
```

The steps it runs are below. Run them after adding or changing strings. The `.pot` files are only made when missing, so delete them first:

```sh
rm -f src/po/*.pot
./src/dev/run make src/po/podshift.pot
```

## Adding a language

For example Finnish:

```sh
./src/dev/run msginit -i src/po/podshift.pot -o src/po/fi.po -l fi --no-translator
```

Then fill in the `msgstr` lines in `src/po/fi.po`.

## Updating a language

After refreshing the template, merge the new strings into each `.po` file:

```sh
./src/dev/run msgmerge --update --backup=none src/po/de.po src/po/podshift.pot
```

New strings get an empty `msgstr`; translate them.

## How translations are used

- **The app:** the build turns each `src/po/<lang>.po` into `dist/po.<lang>.js` (page texts) and `dist/po.manifest.<lang>.js` (the menu entry). Cockpit loads the one that matches the user's language. Strings without a translation are shown in English.
- **Cockpit Applications:** `make install` and the RPM spec use `msgfmt --xml` with all `src/po/*.po` files to write the translated `fyi.vellamo.cockpit_podshift.metainfo.xml`.

Rebuild (`./src/dev/run make`) after changing a `.po` file.
