import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { PartialVideoData } from './interfaces/partial-video-data.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-video')
  getTestVideo(
    @Req() req: Request,
    @Res() res: Response
  ) {
    // Ensure there is a range given for the video
    const range = req.headers.range;

    // get video stats (about 61MB)
    const videoData = this.appService.getTestVideoRange(range);

    // Create headers
    const contentLength = videoData.end - videoData.start + 1;
    const headers = {
      "Content-Range": `bytes ${videoData.start}-${videoData.end}/${videoData.videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    console.log(`piping bytes: ${videoData.start} - ${videoData.end}`);

    // Stream the video chunk to the client
    videoData.stream.pipe(res);
  }
}
