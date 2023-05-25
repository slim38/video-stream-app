import { Injectable } from '@nestjs/common';
import { PartialVideoData } from './models/partial-video-data.interface';
import { createReadStream, statSync } from 'fs';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  
  getTestVideoRange(range: string): PartialVideoData {
    const videoPath = process.env.VIDEO_DIR + "/uploaded1.mp4";
    const videoSize = statSync(videoPath).size;

    let start: number;
    let end: number;
    if (!range) {
      start = 0;
      end = videoSize - 1;
    } else {
      // Parse Range
      // Example: "bytes=32324-"
      const CHUNK_SIZE = 10 ** 6; // 1MB
      start = Number(range.replace(/\D/g, ""));
      end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    }

    // create video read stream for this particular chunk
    const videoStream = createReadStream(videoPath, { start, end });
    return { end, start, videoSize, stream: videoStream };
  }
}
