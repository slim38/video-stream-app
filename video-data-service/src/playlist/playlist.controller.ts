import { Body, Controller, HttpCode, Logger, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
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
        this.logger.log(`Updating Playlist ${data.title}.`);
        return this.service.update(data, id);
    }

}
