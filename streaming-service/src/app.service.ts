import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PartialVideoData } from './models/partial-video-data.interface';
import { ReadStream, createReadStream, createWriteStream, statSync } from 'fs';
import { unlink, writeFile } from 'fs/promises';
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
    let videoSize: number;
    try {
      videoSize = statSync(videoPath).size;;
    } catch (err) {
      this.handleFsReadError(err, id);
    }

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
    let videoStream: ReadStream;
    try {
      videoStream = createReadStream(videoPath, { start, end })
      .on('error', (err: Error) => {
        this.logger.log('Read Stream Error: ' + err);
        if ((err as any)?.code === 'ENOENT') {
          throw new NotFoundException('Specified Video not found');
        }
      });
    } catch (err) {
      this.handleFsReadError(err, id);
    }
    return {
      end,
      start,
      videoSize,
      stream: videoStream
    };
  }

  private handleFsReadError(err: any, id: string) {
    this.logger.error('Failed reading video file. ' + err);
    if (err?.code === 'ENOENT') {
      throw new NotFoundException(`Video ${id} not found.`);
    }
    throw new InternalServerErrorException('Could not read video file. ' + err);
  }

  saveAndPublishVideo(id: string, videoData: VideoUploadMetadata) {
    //const fileWriter = createWriteStream(`./${process.env.VIDEO_DIR}/${id}`);
    
    const uploadEvent: VideoEvent = {
      id,
      ...videoData
    };
    this.clientKafka.emit('video-data', uploadEvent);
  }

  async deleteVideo(id: string) {
    try {
      await unlink(`${process.env.VIDEO_DIR}/${id}`);
    } catch (err) {
      this.logger.error('Failed deleting video file. ' + err);
      if (err?.code === 'ENOENT') {
        this.clientKafka.emit('video-data-delete', { id });
        throw new NotFoundException(`Video ${id} not found.`);
      }
      throw new InternalServerErrorException('Could not delete video file. ' + err);
    }
    this.logger.log('Video deleted and deletion published');
  }
}
