import { Inject, Injectable } from '@nestjs/common';
import { PartialVideoData } from './models/partial-video-data.interface';
import { createReadStream, createWriteStream, statSync } from 'fs';
import { VideoUploadEvent, VideoUploadMetadata } from './models/video-upload-metadata.interface';
import { ClientKafka } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

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
  
  getPartialVideoData(id: string, range: string): PartialVideoData {
    const videoPath = `${process.env.VIDEO_DIR}/${id}`;
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
    return {
      end,
      start,
      videoSize,
      stream: videoStream };
  }

  saveAndPublishVideo(file: Express.Multer.File, videoData: VideoUploadMetadata) {
    const id = uuidv4();
    const fileWriter = createWriteStream(`./${process.env.VIDEO_DIR}/${id}`);
    fileWriter.write(file.buffer);

    const uploadEvent: VideoUploadEvent = {
      id,
      ...videoData
    };
    this.clientKafka.emit('video-data', uploadEvent);
  }
}
