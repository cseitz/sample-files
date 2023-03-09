import { copyFile, mkdir, stat, writeFile } from 'fs/promises';
import { glob } from 'glob';
import mimeTypes from 'mime-types';
import { basename, dirname, extname, relative, resolve } from 'path';
import { inspect } from 'util';
import type { AssetInfo } from './asset';
import { fileURLToPath } from 'url';

// console.log(resolve())

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const __assets = process.cwd() + '/assets';
const foundAssets = await glob(__assets + '/**/*.*', {
    ignore: [
        '**/README.md',
    ]
});

const assets: Record<string, Record<string, Record<string, AssetInfo>>> = {}
const replaces: string[] = [];
const allAssets: AssetInfo[] = [];

function substitute(contents: string) {
    const len = replaces.push(contents);
    return `$$${len - 1}$$`
}

for (const asset of foundAssets) {
    const ext = extname(asset);
    const name = basename(asset, ext);
    const stats = await stat(asset);
    const mime = mimeTypes.lookup(asset) || `unknown/${ext}`;
    const [category, extension] = mime.split('/');
    // console.log(asset, { mime, category, extension })
    const info = {
        mime,
        name,
        type: category,
        bytes: stats.size,
        extension,
        cdn: `https://raw.githubusercontent.com/cseitz/sample-files/main/assets/${relative(__assets, asset)}`,
    }
    assets[category] = assets[category] || {}
    assets[category][extension] = assets[category][extension] || {}
    assets[category][extension][name] = {
        // @ts-ignore
        toJSON() {
            return substitute(`new SampleFileAsset(${JSON.stringify(info)})`)
        },
        __proto__: info,
    }
    allAssets.push(info);
}

// console.log(inspect(assets, {
//     depth: 10,
//     colors: true
// }))

let data = `
import { SampleFileAsset } from './asset'

export const assets = ${(
    JSON.stringify(assets, null, '    ')
)} as const;`;

let i = 0;
for (const replace of replaces) {
    const expr = new RegExp(`(\\\\?['"]?\\$\\$[${i++}]\\$\\$\\\\?['"]?)`, 'gi');
    data = data.replaceAll(expr, replace);
}

const infos = `
export type SampleInfos = {
    type: ${[...new Set(allAssets.map(o => o.type))].map(o => `"${o}"`).join(' | ')},
    name: ${[...new Set(allAssets.map(o => o.name))].map(o => `"${o}"`).join(' | ')},
    mime: ${[...new Set(allAssets.map(o => o.mime))].map(o => `"${o}"`).join(' | ')},
    extension: ${[...new Set(allAssets.map(o => o.extension))].map(o => `"${o}"`).join(' | ')},
    cdn: ${[...new Set(allAssets.map(o => o.cdn))].map(o => `"${o}"`).join(' | ')},
    bytes: ${[...new Set(allAssets.map(o => o.bytes))].map(o => `${o}`).join(' | ')},
}
`

const __build = __dirname + '/../build';
await writeFile(__dirname + '/_assets.ts', data);
await writeFile(__dirname + '/_infos.ts', infos);
await mkdir(__build, { recursive: true });

await copyFile(__dirname + '/_assets.ts', __build + '/_assets.ts');
await copyFile(__dirname + '/_infos.ts', __build + '/_infos.ts');
await copyFile(__dirname + '/asset.ts', __build + '/asset.ts');
await copyFile(__dirname + '/index.ts', __build + '/index.ts');


/*
export const infoEnums = {
    mime: ['video/mp4', 'ye']
} as const;

type Mimes = (typeof infoEnums['mime'])[number]
*/