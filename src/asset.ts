import { createWriteStream } from 'fs';
import { access, mkdir, readFile, stat, unlink, writeFile } from 'fs/promises';
import { pipeline } from 'stream/promises';
import { get, request } from 'https';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';


const ___filename = import.meta.url ? fileURLToPath(import.meta.url) : __filename;
const __dirname = dirname(___filename);


export type AssetInfo = {
    readonly mime: string;
    readonly name: string;
    readonly type: string;
    readonly bytes: number;
    readonly extension: string;
    readonly cdn: string;
}

export class SampleFileAsset<I extends AssetInfo> {
    readonly mime: I['mime'];
    readonly name: I['name'];
    readonly type: I['type'];
    readonly bytes: I['bytes'];
    readonly extension: I['extension'];
    readonly cdn: I['cdn'];

    constructor(info: I) {
        Object.assign(this, info);
    }


    /** Retrieves the absolute path to the assets' parent directory */
    get __dirname() {
        return resolve(__dirname + `/../local-assets/${this.type}/${this.extension}`);
    }

    /** Retrieves the absolute path to the asset
     * **WARNING**: The file will not be present if not yet downloaded. Utilize `path` instead of `__path`
     */
    get __path() {
        return `${this.__dirname}/${this.name}.${this.extension}`;
    }

    /** Checks if the file is downloaded */
    async isDownloaded() {
        const __path = this.__path;
        if (await access(__path, 0).then(o => true).catch(o => false)) {
            const stats = await stat(__path);
            if (stats.size == this.bytes) {
                return true;
            } else {
                await unlink(__path);
            }
        }
        
        return false;
    }

    /** Downloads the file from the CDN */
    async download() {
        const __path = this.__path;
        if (await this.isDownloaded()) {
            return __path;
        }
        await mkdir(this.__dirname, { recursive: true });
        const output = createWriteStream(__path);
        const label = `- Downloading Sample File (${this.cdn})`;
        console.time(label);
        await new Promise(async resolve => {
            const url = new URL(this.cdn);
            const req = get({
                port: 443,
                host: url.hostname,
                path: url.pathname,
                rejectUnauthorized: false,
                headers: {
                    'Accept': '*/*',
                    'Range': `bytes=0-`,
                }
            }, async res => {
                res.pipe(output);
                res.on('end', () => {
                    resolve(true);
                })
            })
            req.on('error', o => console.log(o));
            req.end();
        })
        output.close();
        if (await this.isDownloaded()) {
            console.timeEnd(label);
            return __path
        }
        throw new Error(`Failed to download asset from "${this.cdn}"`)
    }

    /** Retrieves the path to the file
     * - Automatically downloads the file if it is not yet downloaded
     */
    get path() {
        return new Promise<string>(async (resolve, reject) => {
            resolve(await this.download())
        })
    }

}

