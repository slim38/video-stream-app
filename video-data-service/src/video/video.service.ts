import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Video } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { VideoUpdateDto } from './models/video-update.dto';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createVideo(videoInfo: Video) {
    try {
      await this.prisma.video.create({ data: videoInfo });
    } catch (err) {
      this.logger.log('Could not save Video in DB.');
      throw new RpcException('Could not save video in db');
    }
    this.logger.log(`Video ${videoInfo.id} saved in db.`);
  }

  async getVideos(searchValue?: string): Promise<Video[]> {
    try {
      const result = await this.prisma.video.findMany({
        where: {
          title: {
            contains: searchValue,
          },
        },
      });
      this.logger.log(result.length + ' Videos found.');
      return result;
    } catch (err) {
      this.logger.error(`Videos could not be fetched. ${err}`);
      throw new InternalServerErrorException(`Videos could not be fetched.`);
    }
  }

  async deleteVideo(id: string) {
    try {
      await this.prisma.video.delete({
        where: {
          id,
        },
      });
      this.logger.log(`Video ${id} deleted.`);
    } catch (err) {
      if (err?.code === 'P2025') {
        this.logger.error(`Deleting failed: Video ${id} not found.`);
        return;
      }
      this.logger.error(`Video ${id} could not be deleted. ${err}`);
      throw new InternalServerErrorException(
        `Video ${id} could not be deleted.`,
      );
    }
  }

  async updateVideo(id: string, updatedVideo: VideoUpdateDto) {
    try {
      await this.prisma.video.update({
        where: {
          id,
        },
        data: updatedVideo,
      });
      this.logger.log(`Video ${id} updated.`);
    } catch (err) {
      if (err?.code === 'P2025') {
        this.logger.error(`Updating failed: Video ${id} not found.`);
        throw new BadRequestException(`Video ${id} not found.`);
      }
      this.logger.error(`Video ${id} could not be updated. ${err}`);
      throw new InternalServerErrorException(
        `Video ${id} could not be updated.`,
      );
    }
  }
}
