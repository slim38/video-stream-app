import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PartialVideoData } from './models/partial-video-data.interface';
import { createReadStream, createWriteStream, statSync } from 'fs';
import { unlink } from 'fs/promises';
import { VideoEvent, VideoUploadMetadata } from './models/video-upload-metadata.interface';
import { ClientKafka } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

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

    const uploadEvent: VideoEvent = {
      id,
      ...videoData
    };
    this.clientKafka.emit('video-data', uploadEvent);
    this.logger.log('New Video saved and published');
  }

  async deleteVideo(id: string) {
    try {
      await unlink(`${process.env.VIDEO_DIR}/${id}`);
    } catch (err) {
      this.logger.error('Failed deleting video file. ' + err);
      if (err?.code === 'ENOENT') {
        throw new NotFoundException(`Video ${id} not found.`);
      }
      throw new InternalServerErrorException('Could not delete video file. ' + err);
    }
    this.clientKafka.emit('video-data-delete', { id });
    this.logger.log('Video deleted and deletion published');
  }
}
