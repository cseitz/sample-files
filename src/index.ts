import { SampleFileAsset } from './asset';
import { assets } from './_assets'

export const sampleFiles = Object.assign(assets, {
    /** Filter assets by the specified search */
    filter: SampleFileAsset.filter,
});

// sampleFiles.filter({ type: 'video' })
// sampleFiles.filter(o => o.bytes > 1000);
// sampleFiles.filter({ name: 'bbb_short', extension: 'mp4' }).pop()
