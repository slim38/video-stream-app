import { Body, Controller, Logger, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { PlaylistCreateDto } from './models/playlist.dto';
import { PlaylistService } from './playlist.service';

@Controller('playlist')
export class PlaylistController {
    private readonly logger = new Logger(PlaylistController.name)

    constructor(private readonly service: PlaylistService) {}

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(@Body() data: PlaylistCreateDto) {
        this.logger.log(`Creating Playlist ${data.title}.`);
        return this.service.create(data);
    }
}
