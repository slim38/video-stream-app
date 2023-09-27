import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PrismaService } from 'src/prisma.service';
import { PlaylistController } from './playlist.controller';

@Module({
  providers: [PlaylistService, PrismaService],
  controllers: [PlaylistController]
})
export class PlaylistModule {}
