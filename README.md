# Sample Files

A small collection of files in various formats.

Useful for testing media conversions or having sample files to test media players.

Supports ESM, CJS, and TypeScript.

[View Sample Files](./assets)

## Installation

`npm install sample-files`

## Usage

By default, this package only includes references to the various [sample Files](./assets).

```tsx
import { sampleFiles } from 'sample-files';

// Big Buck Bunny - 10 second clip (mp4)
const sampleVideo = sampleFiles.video.mp4.bbb_short;

// Absolute path to the video on your machine
const __sampleVideo = await sampleVideo.path;
//                     ^ calls sampleVideo.downlolad()
// note: download() only downloads if not already downloaded
```

When you `await sampleVideo.path`, you are actually calling `sampleVideo.download()` which downloads the video to your machine.

This is intentional, and keeps the filesize of the package very low. If all you need is a nice dictionary of remote files, then you don't need to reference the path at all.

### Remote Files (CDN)
```tsx
// https://raw.githubusercontent.com/cseitz/sample-files/main/assets/video/mp4/bbb_short.mp4
const remoteMP4 = sampleVideo.cdn;
```

You can still access the path directly without await; but the file actually existing is not guarenteed.

```tsx
import { sampleFiles } from 'sample-files';

// Big Buck Bunny - 10 second clip (mp4)
const sampleVideo = sampleFiles.video.mp4.bbb_short;

// Absolute path to the video on your machine
const __sampleVideo = sampleVideo.__path;

// BE SURE IT IS DOWNLOADED BEFORE YOU USE IT
if (await sampleVideo.isDownloaded()) {
    // use the file
}
```

### Filtering

You can also filter all the sample files.

```tsx
import { sampleFiles } from 'sample-files';

// array of all videos (in various formats)
const videos = sampleFiles.filter({ type: 'video' });

// array of all files that are over 10 MB
const largeFiles = sampleFiles.filter(file => file.bytes > 10000000);

// assets/video/mp4/bbb_short.mp4
const bbb_short_mp4 = sampleFiles.filter({ name: 'bbb_short', extension: 'mp4' }).pop();
```

## Contributing

If you have any files you would like to add, please create a PR.

Only files that may legally be posted here and published to NPM should be contributed. Please don't make me have to review licenses and stuff... don't put pirated files here.
