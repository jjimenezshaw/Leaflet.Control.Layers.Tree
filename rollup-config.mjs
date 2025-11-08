// copied and adapted from leaflet repository
import {readFileSync} from 'node:fs';

import json from '@rollup/plugin-json';
import {simpleGit} from 'simple-git';
import del from 'rollup-plugin-delete';
import rollupGitVersion from 'rollup-plugin-git-version';

import pkg from './package.json' with { type: 'json' };

const release = process.env.NODE_ENV === 'release';
const version = await getVersion();
const banner = createBanner(version);

/** @type {import('rollup').RollupOptions} */
const config = {
    input: 'LayersTree.js',
    output: [
        {
            file: './dist/LayersTree-umd.js',
            name: 'LayersTree',
            format: 'umd',
            banner,
            globals: {leaflet: 'L'},
        },
        {
            file: './dist/LayersTree.js',
            name: 'LayersTree',
            format: 'es',
            banner,
        },
    ],
    plugins: [
        del({targets: 'dist'}),
        release ? json() : rollupGitVersion(),
        {
            name: 'copy-plugin-assets',
            generateBundle() {
                const fileNames = [
                    'L.Control.Layers.Tree.css',
                    'L.Control.Layers.Tree.d.ts',
                    'L.Control.Layers.Tree.js',
                    'LayersTree.d.ts',
                ];
                for (const fileName of fileNames) {
                    const source = readFileSync(new URL(`./${fileName}`, import.meta.url));
                    this.emitFile({type: 'asset', fileName, source: `${banner}${source}`});
                }
            },
        },
    ],
    external: ['leaflet'],
    watch: {
        include: ['LayersTree.js'],
    },
};

export default config;

async function getVersion() {
    // Skip the git branch+rev in the banner when doing a release build
    if (release) {
        return pkg.version;
    }

    const git = simpleGit();
    const branch = (await git.branch()).current;
    const commit = await git.revparse(['--short', 'HEAD']);

    return `${pkg.version}+${branch}.${commit}`;
}

export function createBanner(version) {
    return `/*
 * Leaflet Control Layers Tree ${version}, a Leaflet plugin.
 * (c) 2017-${new Date().getFullYear()} Javier Jimenez Shaw
 */
`;
}
