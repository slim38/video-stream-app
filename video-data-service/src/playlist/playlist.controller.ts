import { Body, Controller, Delete, Get, HttpCode, Logger, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { PlaylistCreateDto, PlaylistUpdateDto } from './models/playlist.dto';
import { PlaylistService } from './playlist.service';

@Controller('playlist')
export class PlaylistController {
    private readonly logger = new Logger(PlaylistController.name)

    constructor(private readonly service: PlaylistService) {}

    @Post()
    @HttpCode(201)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(@Body() data: PlaylistCreateDto) {
        this.logger.log(`Creating Playlist ${data.title}.`);
        return this.service.create(data);
    }

    @Put(':id')
    @HttpCode(204)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async update(@Body() data: PlaylistUpdateDto, @Param('id') id: string) {
        this.logger.log(`Updating Playlist ${id}.`);
        return this.service.update(data, id);
    }

    @Delete(':id')
    @HttpCode(204)
    async delete(@Param('id') id: string) {
        this.logger.log(`Deleting Playlist ${id}.`);
        return this.service.delete(id);
    }

    @Get('search/:searchword')
    async search(@Param('searchword') searchword: string) {
        this.logger.log(`Searching Playlists: ${searchword}`);
        return this.service.getPlaylistOverviews(searchword);
    }

    @Get()
    async getAll() {
        this.logger.log(`Retrieving Playlist overviews`);
        return this.service.getPlaylistOverviews();
    }

    @Get(':id')
    async get(@Param('id') id: string) {
        this.logger.log(`Retrieving Playlists: ${id}`);
        return this.service.getPlaylist(id);
    }
}
