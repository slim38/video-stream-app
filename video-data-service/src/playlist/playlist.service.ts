import { BadRequestException, Body, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PlaylistDto, PlaylistPositionDto } from './models/playlist.dto';

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
            this.logger.log(`Playlist ${result.title} with id ${result.id} created.`);
        } catch (err) {
            this.checkForClientError(err);
            this.logger.error(`Creating failed:` + err);
            throw new InternalServerErrorException();
        }
    }

    async update(playlist: PlaylistDto, id: string) {
        const { positionUpdateStatement, positionDeleteStatement } = this
            .getPosDeleteAndUpdateStatement(playlist, id);
        try {
            const result = await this.prisma.playlist.update({
                data: {
                    title: playlist.title,
                    PlaylistPosition: {
                        upsert: positionUpdateStatement,
                        delete: positionDeleteStatement,
                    }
                },
                where: {
                    id,
                }
            });
            this.logger.log(`Playlist ${result.title} with id ${result.id} updated`);
        } catch (err) {
            this.checkForClientError(err);
            console.log(err);
            this.logger.error(`Updating failed:` + err);
            throw new InternalServerErrorException();
        }
    }

    private getPosDeleteAndUpdateStatement(playlist: PlaylistDto, id: string) {
        const [toUpsert, toDelete] = playlist.videos?.reduce((result, element) => {
            result[element.delete ? 1 : 0].push(element);
            return result;
        }, [[], []] as [PlaylistPositionDto[], PlaylistPositionDto[]]);
        const positionUpdateStatement = toUpsert?.map((video) => {
            return {
                where: {
                    videoId_playlistId: {
                        videoId: video.videoId,
                        playlistId: id,
                    },
                },
                update: {
                    position: video.position,
                },
                create: {
                    videoId: video.videoId,
                    position: video.position,
                }
            };
        });
        const positionDeleteStatement = toDelete?.map((video) => {
            return {
                videoId_playlistId: {
                    videoId: video.videoId,
                    playlistId: id,
                }
            };
        });
        return { positionUpdateStatement, positionDeleteStatement };
    }

    private checkForClientError(err: { code: string}) {
        if (err?.code === 'P2003') {
            this.logger.error(`Update failed: specified video not found.`);
            throw new BadRequestException(`Spedicified video not found.`);
        }
        if (err?.code === 'P2002') {
            this.logger.error(`Update failed: specified video is listed several times.`);
            throw new BadRequestException(`Spedicified video is listed several times.`);
        }
        if (err?.code === 'P2017') {
            this.logger.error(`Update failed: specified video is not in the playlist.`);
            throw new BadRequestException(`Spedicified video is not in the playlist.`);
        }
    }
}
