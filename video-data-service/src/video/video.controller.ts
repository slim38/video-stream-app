import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { VideoEventDTO } from './models/video-event.dto';
import { validate } from 'class-validator';
import { VideoService } from './video.service';
import { VideoDeleteEventDTO } from './models/video-delete-event.dto';
import { VideoUpdateDto } from './models/video-update.dto';

@Controller('video')
export class VideoController {
  private readonly logger = new Logger(VideoController.name);

  constructor(private readonly service: VideoService) {}

  @EventPattern('video-data')
  async consumeVideoEvent(
    @Payload() videoEvent: VideoEventDTO,
    @Ctx() ctx: KafkaContext,
  ) {
    if (!(await this.eventIsValid(videoEvent))) {
      this.logger.error('Invalid event. Context:' + JSON.stringify(ctx));
      return;
    }

    this.logger.log('Handling incoming video event');
    this.service.createVideo(videoEvent);
  }

  @EventPattern('video-data-delete')
  async consumeVideoDeleteEvent(
    @Payload() videoDeleteEvent: VideoDeleteEventDTO,
    @Ctx() ctx: KafkaContext,
  ) {
    if (!(await this.eventIsValid(videoDeleteEvent))) {
      this.logger.error('Invalid DELETE event. Context:' + JSON.stringify(ctx));
      return;
    }
    this.logger.log('Handle incoming delete event.');
    await this.service.deleteVideo(videoDeleteEvent.id);
  }

  private async eventIsValid(videoEvent: VideoDeleteEventDTO | VideoEventDTO) {
    if (typeof videoEvent !== 'object' || videoEvent === null) {
      this.logger.error('Event message is not an object.');
      return false;
    }

    const validationErrors = await validate(videoEvent);
    if (validationErrors.length > 0) {
      this.logger.error('Invalid event data format.');
      return false;
    }

    return true;
  }

  @Get('search/:searchword')
  async searchVideoData(@Param('searchword') searchword: string) {
    this.logger.log('Searching Videos: ' + searchword);
    return this.service.getVideos(searchword);
  }

  @Get()
  async getAllVideos() {
    this.logger.log('Retrieving all videos.');
    return this.service.getVideos();
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() data: VideoUpdateDto) {
    console.log(data);
    this.logger.log(`Updating Video ${id}`);
    return this.service.updateVideo(id, data);
  }
}
