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

const __build = __dirname + '/../build';
await writeFile(__dirname + '/assets.ts', data);
await mkdir(__build, { recursive: true });

await copyFile(__dirname + '/asset.ts', __build + '/asset.ts');
await copyFile(__dirname + '/assets.ts', __build + '/assets.ts');
await copyFile(__dirname + '/index.ts', __build + '/index.ts');
