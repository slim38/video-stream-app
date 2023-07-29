import { Inject, Injectable } from '@nestjs/common';
import { PartialVideoData } from './models/partial-video-data.interface';
import { createReadStream, statSync } from 'fs';
import { networkInterfaces } from 'os';
import { Kafka } from 'kafkajs';
import { VideoUploadMetadata } from './models/video-upload-metadata.interface';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @Inject('PUBLISHER_SERVICE')
    private readonly clientKafka: ClientKafka
  ) {}

  getHello(): string {
    this.clientKafka.emit('video-data', 'hello world');
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

  saveAndPublishVideo(videoData: VideoUploadMetadata) {
    this.clientKafka.emit('video-data', 'hello world');
  }
}
