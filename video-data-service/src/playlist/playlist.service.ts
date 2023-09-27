import { BadRequestException, Body, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PlaylistDto } from './models/playlist.dto';

@Injectable()
export class PlaylistService {
    private readonly logger = new Logger(PlaylistService.name)

    constructor(private readonly prisma: PrismaService) {}

    async create(playlist: PlaylistDto) {
        try {
            const result = await this.prisma.playlist.create({
                data: {
                    title: playlist.title,
                    PlaylistPosition: {
                        create: playlist.videos,
                    }
                }
            });
            this.logger.log(`Playlist ${result.title} with id ${result.id} data to db`);
        } catch (err) {
            if (err?.code === 'P2003') {
                this.logger.error(`Creating failed: specified video not found.`);
                throw new BadRequestException(`Spedicified video not found.`);
            }
            console.log(err);
            this.logger.error(`Creating failed:` + err);
            throw new InternalServerErrorException();
        }
    }
}
