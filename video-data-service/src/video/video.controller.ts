import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller('video')
export class VideoController {
    @EventPattern('video-data')
    async consumeVideoEvent() {
        console.log('hello-world');
    }
}
