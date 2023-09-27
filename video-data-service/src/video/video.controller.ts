import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import { VideoEventDTO } from './models/video-event.interface';
import { validate } from 'class-validator';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
    private readonly logger = new Logger(VideoController.name);

    constructor(private readonly service: VideoService) {}

    @EventPattern('video-data')
    async consumeVideoEvent(@Payload() videoEvent: VideoEventDTO, @Ctx() kafkaKontext: KafkaContext) {
        if (typeof videoEvent !== 'object' || videoEvent === null) {
            this.logger.error('Event message is not an object. Context:' + JSON.stringify(kafkaKontext));
            return;
        }
        
        const validationErrors = await validate(videoEvent);
        if (validationErrors.length > 0) {
            this.logger.error('Invalid event received. Context:' + JSON.stringify(kafkaKontext));
            return;
        }

        this.logger.log('Handling incoming video event');
        this.service.createVideo(videoEvent);
    }
}
