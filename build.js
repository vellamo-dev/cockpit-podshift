#!/usr/bin/env node
/*
 * SPDX-License-Identifier: LGPL-2.1-or-later
 * The licence text is in docs/licenses/LGPL-2.1.txt.
 *
 * Based on build.js from the Cockpit starter kit
 * (https://github.com/cockpit-project/starter-kit) by Red Hat, Inc.,
 * restructured locally.
 */

/**
 * Esbuild script for the Cockpit app: writes dist/, translations, and the runtime module list.
 *
 * @file build.js
 * @license LGPL-2.1-or-later
 * @author Red Hat, Inc.
 * @author Vellamo.fyi
 */

import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import process from 'node:process';
import util from 'node:util';

import { sassPlugin } from 'esbuild-sass-plugin';

import { cockpitPoEsbuildPlugin } from './artifacts/cockpit-lib/cockpit-po-plugin.js';
import { cockpitRsyncEsbuildPlugin } from './artifacts/cockpit-lib/cockpit-rsync-plugin.js';
import { cockpitCompressPlugin } from './artifacts/cockpit-lib/esbuild-compress-plugin.js';

/**
 * @typedef {object} BuildArgs
 * @property {string | undefined} rsync SSH host to rsync dist/ to after each successful build.
 * @property {boolean} watch Whether to keep running and rebuild on changes.
 */

/** @typedef {import('esbuild').BuildContext} BuildContext */
/** @typedef {import('esbuild').BuildOptions} BuildOptions */
/** @typedef {import('esbuild').BuildResult} BuildResult */
/** @typedef {import('esbuild').Metafile} Metafile */
/** @typedef {import('esbuild').Plugin} Plugin */

/**
 * Builds the app into dist/ once, or keeps rebuilding it in watch mode.
 */
export class Builder {
    /** Output folder. It is emptied, never removed, so VM shares of it stay valid. */
    static OUT_DIR = 'dist';

    /** Folder with the app sources and the extra files to copy. */
    static SRC_DIR = 'src/app';

    /** RPM spec file; its Version: line is the UI version. */
    static SPEC_FILE = 'cockpit-podshift.spec';

    static ENTRY = './src/app/index.jsx';

    /** Folders searched by bare import statements, also used as Sass load paths. */
    static NODE_PATHS = ['artifacts/cockpit-lib'];

    /** Files that are not imported by the code, so esbuild does not copy them itself. */
    static COPY_FILES = ['manifest.json', 'index.html'];

    static METAFILE = 'metafile.json';
    static RUNTIME_MODULES_FILE = 'runtime-npm-modules.txt';
    static PRODUCTION = process.env.NODE_ENV === 'production';

    /**
     * Matches the chain of node_modules/<package>/ folders anywhere in a path, nested installations included,
     * e.g. "node_modules/a/node_modules/@scope/b/".
     */
    static PACKAGE_PATH = /(?:^|\/)((?:node_modules\/(?:@[^/]+\/)?[^/]+\/)+)/;

    /** @type {BuildArgs} */
    #args;

    /**
     * Creates a builder for one run.
     *
     * @param {BuildArgs} args Parsed command line arguments.
     */
    constructor(args) {
        this.#args = args;
    }

    /** Help text for -h/--help and for an invalid command line. */
    static USAGE = [
        'usage: build.js [-h] [-r HOST] [-w]',
        '',
        'options:',
        '  -h, --help        show this help message and exit',
        '  -r, --rsync HOST  rsync bundles to ssh target after build',
        '  -w, --watch       Enable watch mode',
    ].join('\n');

    /**
     * Parses the command line. --watch defaults to the ESBUILD_WATCH environment variable.
     * Prints the usage and exits for -h/--help (code 0) and for an invalid command line (code 2).
     *
     * @returns {BuildArgs} The parsed arguments.
     */
    static parseArgs() {
        let values;
        try {
            ({ values } = util.parseArgs({
                options: {
                    help: { type: 'boolean', short: 'h' },
                    rsync: { type: 'string', short: 'r' },
                    watch: { type: 'boolean', short: 'w', default: process.env.ESBUILD_WATCH === 'true' },
                },
            }));
        } catch (error) {
            console.error(`${Builder.USAGE}\n\nbuild.js: error: ${error.message}`);
            process.exit(2);
        }
        if (values.help) {
            console.log(Builder.USAGE);
            process.exit(0);
        }
        return { rsync: values.rsync, watch: Boolean(values.watch) };
    }

    /**
     * Stops a host build. `./src/dev/run` sets `COCKPIT_PODSHIFT_CONTAINER=1` in the container.
     */
    static requireContainer() {
        if (process.env.COCKPIT_PODSHIFT_CONTAINER !== '1') {
            console.error('Build must run in the container: npm run build');
            process.exit(1);
        }
    }

    /**
     * Loads esbuild: the wasm build on non-x64 machines, the native one otherwise.
     * Falls back to a distro package (e.g. Debian's /usr/lib/*\/nodejs/esbuild) when node_modules has none.
     *
     * @returns {Promise<typeof import('esbuild')>} The esbuild API.
     */
    static async loadEsbuild() {
        try {
            return (await import(os.arch() !== 'x64' ? 'esbuild-wasm' : 'esbuild')).default;
        } catch (e) {
            if (e.code !== 'ERR_MODULE_NOT_FOUND')
                throw e;
            // createRequire uses Node's module resolution, which also searches the system paths
            const require = createRequire(import.meta.url);
            return (await import(require.resolve('esbuild'))).default;
        }
    }

    /**
     * Reads package.json.
     *
     * @returns {{name: string}} The parsed package.json.
     */
    static readPackageJson() {
        return JSON.parse(fs.readFileSync('package.json', 'utf8'));
    }

    /**
     * Reads the Version: line of the RPM spec, the same way the Makefile does.
     *
     * @param {string} [specFile] Spec path, or Builder.SPEC_FILE when omitted.
     * @returns {string} The version, for example 0.1.0.
     * @throws {Error} When the Version line is missing or empty.
     */
    static readVersion(specFile = Builder.SPEC_FILE) {
        const text = fs.readFileSync(specFile, 'utf8');
        for (const line of text.split('\n')) {
            if (!/^Version:/.test(line))
                continue;
            const version = line.split(/\s+/)[1];
            if (version)
                return version;
            break;
        }
        throw new Error(`No Version: line in ${specFile}`);
    }

    /**
     * Runs the build once, or starts watch mode.
     *
     * @returns {Promise<void>} Resolves when a single build is done; in watch mode it never resolves.
     */
    async run() {
        const esbuild = await Builder.loadEsbuild();
        const context = await esbuild.context(Builder.esbuildOptions(this.#args));

        if (this.#args.watch)
            await Builder.#watch(context);
        else
            await Builder.#buildOnce(context);
    }

    /**
     * Builds once, writes the metafile and the runtime module list, and always disposes the context.
     * On failure, it prints why and sets exit code 1.
     *
     * @param {BuildContext} context The esbuild context.
     * @returns {Promise<void>} Resolves when done.
     */
    static async #buildOnce(context) {
        try {
            const result = await context.rebuild();
            Builder.writeMetafile(result.metafile);
            Builder.writeRuntimeModules(result.metafile);
        } catch (e) {
            // esbuild has already printed the individual errors
            console.error(`Build failed: ${e.message}`);
            process.exitCode = 1;
        } finally {
            await context.dispose();
        }
    }

    /**
     * Rebuilds on every change until SIGINT or SIGTERM, then disposes the context and exits.
     * esbuild watches the files in the build graph; the copied files are not in it, so they are watched here.
     *
     * @param {BuildContext} context The esbuild context.
     * @returns {Promise<void>} Never resolves; the process exits from the signal handler.
     */
    static async #watch(context) {
        for (const signal of ["SIGINT", "SIGTERM"])
            process.once(signal, () => Builder.#stop(context));

        await context.watch();

        fs.watch(Builder.SRC_DIR, (event, fileName) => {
            if (event === 'change' && Builder.COPY_FILES.includes(fileName))
                context.rebuild().catch(e => console.error(`Rebuild failed: ${e.message}`));
        });

        await new Promise(() => {});
    }

    /**
     * Disposes the context and exits, for the watch mode signal handlers.
     *
     * @param {BuildContext} context The esbuild context.
     * @returns {Promise<void>} Never resolves; the process exits.
     */
    static async #stop(context) {
        await context.dispose();
        process.exit(0);
    }

    /**
     * Returns the esbuild options. Sourcemaps in development builds, minified and compressed in production.
     *
     * @param {BuildArgs} args Parsed command line arguments.
     * @returns {BuildOptions} The options for esbuild.context().
     */
    static esbuildOptions(args) {
        return {
            ...!Builder.PRODUCTION ? { sourcemap: "linked" } : {},
            bundle: true,
            entryPoints: [Builder.ENTRY],
            // Not bundled, loaded at runtime from Cockpit: fonts (../../static/fonts), PatternFly
            // background images (.svg), and the .woff, .jpg and ../../assets paths of the Cockpit template
            external: ['*.woff', '*.woff2', '*.jpg', '*.svg', '../../assets*'],
            // Move all legal comments to a .LEGAL.txt file
            legalComments: 'external',
            // .py: artifacts/cockpit-lib/serverTime.js imports a Python helper as text
            loader: { ".js": "jsx", ".py": "text" },
            minify: Builder.PRODUCTION,
            define: { __PODSHIFT_UI_VERSION__: JSON.stringify(Builder.readVersion()) },
            nodePaths: Builder.NODE_PATHS,
            outdir: Builder.OUT_DIR,
            metafile: true,
            target: ['es2020'],
            plugins: [
                Builder.emptyDistPlugin(),
                Builder.copyAssetsPlugin(),
                sassPlugin({
                    loadPaths: [...Builder.NODE_PATHS, 'node_modules'],
                    filter: /\.scss/,
                    quietDeps: true,
                }),
                cockpitPoEsbuildPlugin({ podir: 'src/po' }),
                ...Builder.PRODUCTION ? [cockpitCompressPlugin()] : [],
                Builder.rsyncPlugin(args.rsync),
                Builder.notifyEndPlugin(),
            ],
        };
    }

    /**
     * Returns a plugin that empties dist/ before each build but keeps the folder,
     * so mounts of it (VM shares) keep working.
     *
     * @returns {Plugin} The empty-dist plugin.
     */
    static emptyDistPlugin() {
        return {
            name: 'empty-dist',
            setup(build) {
                build.onStart(() => {
                    fs.mkdirSync(Builder.OUT_DIR, { recursive: true });
                    for (const entry of fs.readdirSync(Builder.OUT_DIR))
                        fs.rmSync(path.join(Builder.OUT_DIR, entry), { recursive: true, force: true });
                });
            },
        };
    }

    /**
     * Returns a plugin that copies COPY_FILES into dist/ after each successful build,
     * then adds the spec version to dist/manifest.json so a built dist/ shows its version.
     *
     * @returns {Plugin} The copy-assets plugin.
     */
    static copyAssetsPlugin() {
        return {
            name: 'copy-assets',
            setup(build) {
                build.onEnd(async result => {
                    if (result.errors.length !== 0)
                        return;
                    await Promise.all(Builder.COPY_FILES.map(file =>
                        fs.promises.copyFile(path.join(Builder.SRC_DIR, file), path.join(Builder.OUT_DIR, file))));
                    await Builder.writeManifestVersion();
                });
            },
        };
    }

    /**
     * Adds "version" from the spec to dist/manifest.json. Cockpit ignores keys it does not use.
     */
    static async writeManifestVersion() {
        const file = path.join(Builder.OUT_DIR, 'manifest.json');
        const manifest = JSON.parse(await fs.promises.readFile(file, 'utf8'));
        const withVersion = { version: Builder.readVersion(), ...manifest };
        await fs.promises.writeFile(file, JSON.stringify(withVersion, null, 4) + '\n');
    }

    /**
     * Returns Cockpit's rsync plugin. The plugin takes only the target folder as an option and reads
     * the SSH host from process.env.RSYNC, so --rsync is passed on through that variable here.
     *
     * @param {string | undefined} host SSH host from --rsync, if any.
     * @returns {Plugin} The rsync plugin; it does nothing without a host.
     */
    static rsyncPlugin(host) {
        if (host)
            process.env.RSYNC = host;
        return cockpitRsyncEsbuildPlugin({ dest: Builder.readPackageJson().name });
    }

    /**
     * Returns a plugin that logs how long each build took, with its error and warning counts.
     *
     * @returns {Plugin} The notify-end plugin.
     */
    static notifyEndPlugin() {
        return {
            name: 'notify-end',
            setup(build) {
                let startTime = 0;

                build.onStart(() => {
                    startTime = performance.now();
                });

                build.onEnd(result => {
                    const duration = Math.round(performance.now() - startTime);
                    const timeStamp = new Date().toLocaleTimeString('en-GB');
                    const counts = `${result.errors.length} errors, ${result.warnings.length} warnings`;
                    console.log(`${timeStamp}: Build finished in ${duration} ms (${counts})`);
                });
            },
        };
    }

    /**
     * Writes the esbuild metafile.
     *
     * @param {Metafile} metafile The metafile of the build.
     */
    static writeMetafile(metafile) {
        fs.writeFileSync(Builder.METAFILE, JSON.stringify(metafile));
    }

    /**
     * Returns the package-lock.json keys of the npm packages in the bundle, e.g. "node_modules/react"
     * or "node_modules/a/node_modules/b" for a nested installation.
     *
     * @param {Metafile} metafile The metafile of the build.
     * @returns {Set<string>} The package-lock.json keys.
     */
    static bundledPackages(metafile) {
        const keys = new Set();
        for (const inputPath of Object.keys(metafile.inputs)) {
            const match = Builder.PACKAGE_PATH.exec(inputPath);
            if (match)
                keys.add(match[1].slice(0, -1));
        }
        return keys;
    }

    /**
     * Writes "<name> <version>" for each bundled npm package, sorted by name, for dependency tracking.
     * A package without a version in package-lock.json fails a production build and warns otherwise.
     *
     * @param {Metafile} metafile The metafile of the build.
     */
    static writeRuntimeModules(metafile) {
        const lockPackages = JSON.parse(fs.readFileSync('package-lock.json', 'utf8')).packages ?? {};
        const lines = [];
        const missing = [];

        for (const key of Builder.bundledPackages(metafile)) {
            const name = key.slice(key.lastIndexOf('node_modules/') + 'node_modules/'.length);
            const version = lockPackages[key]?.version;
            if (version)
                lines.push(`${name} ${version}`);
            else
                missing.push(name);
        }

        if (missing.length > 0) {
            const message = `Could not find a version in package-lock.json for: ${missing.join(', ')}`;
            if (Builder.PRODUCTION)
                throw new Error(message);
            console.error(`Warning: ${message}`);
        }

        lines.sort((a, b) => a.localeCompare(b, 'en'));
        fs.writeFileSync(Builder.RUNTIME_MODULES_FILE, lines.join('\n') + '\n');
    }
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    const args = Builder.parseArgs();
    Builder.requireContainer();
    await new Builder(args).run();
}
