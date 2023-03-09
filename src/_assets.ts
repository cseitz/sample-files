
import { SampleFileAsset } from './asset'

export const assets = {
    "video": {
        "mp4": {
            "bbb_short": new SampleFileAsset({"mime":"video/mp4","name":"bbb_short","type":"video","bytes":788493,"extension":"mp4","cdn":"https://raw.githubusercontent.com/cseitz/sample-files/main/assets/video/mp4/bbb_short.mp4"})
        }
    }
} as const;