import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Video } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class VideoService {
    private readonly logger = new Logger(VideoService.name);

    constructor(private readonly prisma: PrismaService) {}

    async createVideo(videoInfo: Video) {
        try {
            await this.prisma.video.create({ data: videoInfo })
        } catch (err) {
            this.logger.log('Could not save Video in DB.');
            throw new RpcException('Could not save video in db');
        }
        this.logger.log(`Video ${videoInfo.id} saved in db.`)
    }

    async deleteVideo(id: string) {
        try {
            await this.prisma.video.delete({
                where: {
                    id,
                },
            });
            this.logger.log(`Video ${id} deleted.`)
        } catch (err) {
            if (err?.code === 'P2025') {
                this.logger.error(`Deleting failed: Video ${id} not found.`);
                return;
            }
            this.logger.error(`Video ${id} could not be deleted. ${err}`);
            throw new InternalServerErrorException(`Video ${id} could not be deleted.`);
        }
    }
}
