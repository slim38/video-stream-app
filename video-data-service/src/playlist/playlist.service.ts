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
                    playlistPosition: {
                        create: playlist.playlistPosition,
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
                    playlistPosition: {
                        upsert: positionUpdateStatement,
                        deleteMany: positionDeleteStatement
                    }
                },
                where: {
                    id,
                }
            });
            this.logger.log(`Playlist ${result.title} with id ${result.id} updated`);
        } catch (err) {
            this.checkForClientError(err, id);
            console.log(err);
            this.logger.error(`Updating failed:` + err);
            throw new InternalServerErrorException();
        }
    }

    async delete(id: string) {
        try {
            await this.prisma.playlist.delete({
                where: {
                    id,
                },
            });
            this.logger.log(`Playlist ${id} deleted.`);
        } catch (err) {
            this.checkForClientError(err, id);
            this.logger.error('Could not delete Playlist. ' + err);
            throw new InternalServerErrorException('Could not delete Playlist');
        }
    }

    async getPlaylistOverviews(searchword?: string) {
        try {
            const result = await this.prisma.playlist.findMany({
                where: {
                    title: {
                        contains: searchword,
                    }
                },
            });
            this.logger.log(result.length + ' Playlists found.');
            return result;
        } catch (err) {
            this.logger.error(`Playlists could not be fetched. ${err}`);
            throw new InternalServerErrorException(`Playlists could not be fetched.`);
        }
    }

    async getPlaylist(id: string) {
        try {
            const result = await this.prisma.playlist.findFirstOrThrow({
                where: {
                    id,
                },
                include: {
                    playlistPosition: {
                        select: {
                            video: true,
                            position: true,
                            videoId: true,
                        }
                    },
                },
            });
            this.logger.log(`Playlist ${result.id} retrieved.`);
            return result;
        } catch (err) {
            this.checkForClientError(err, id);
            this.logger.error(`Playlists ${id} could not be fetched. ${err}`);
            throw new InternalServerErrorException('Playlists could not be fetched.');
        }
    }

    private getPosDeleteAndUpdateStatement(playlist: PlaylistDto, id: string) {
        const videoIds: string[] = [];
        const positionUpdateStatement = playlist.playlistPosition?.map((pos) => {
            videoIds.push(pos.videoId)
            return {
                where: {
                    videoId_playlistId: {
                        videoId: pos.videoId,
                        playlistId: id,
                    },
                },
                update: {
                    position: pos.position,
                },
                create: {
                    videoId: pos.videoId,
                    position: pos.position,
                }
            };
        });
        const positionDeleteStatement = { 
            videoId: {
                notIn: videoIds,
            }
        };
        return { positionUpdateStatement, positionDeleteStatement };
    }

    private checkForClientError(err: { code: string}, id?: string) {
        if (err?.code === 'P2025') {
            this.logger.error(`Operation failed: Playlist ${id} not found.`);
            throw new BadRequestException(`Playlist ${id} not found.`);
        }
        if (err?.code === 'P2003') {
            this.logger.error(`Operation failed: specified video not found.`);
            throw new BadRequestException(`Spedicified video not found.`);
        }
        if (err?.code === 'P2002') {
            this.logger.error(`Operation failed: specified video is listed several times.`);
            throw new BadRequestException(`Spedicified video is listed several times.`);
        }
        if (err?.code === 'P2017') {
            this.logger.error(`Operation failed: specified video is not in the playlist.`);
            throw new BadRequestException(`Spedicified video is not in the playlist.`);
        }
    }
}
