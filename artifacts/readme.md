# Artifacts

Generated output from build and test runs. Only this readme is tracked in git; everything else here is transient and gitignored.

- `cockpit-lib/` - Cockpit `pkg/lib` fetched from a pinned release tarball at build time.
- `logs/` - build and test logs.
- `rpm/` - the built RPM package, when an RPM is produced.
- `tmp/` - the cached Cockpit source tarball used to extract cockpit-lib/, and other temporary data.
- `work/` - temporary files from scripts and tools.

To keep each worker's data separate, use a subdirectory under `work/`.

These folders can be deleted at any time and recreated as needed.

Do not place items directly in this directory; use the subdirectories listed above.
