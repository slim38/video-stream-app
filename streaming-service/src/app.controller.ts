import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-video')
  getTestVideo(
    @Req() req: Request,
    @Res() res: Response
    ) {
  // get video stats (about 61MB)
  const videoPath = process.env.VIDEO_DIR + "/bigbuck.mp4";
  const videoSize = fs.statSync(videoPath).size;

    // Ensure there is a range given for the video
    const range = req.headers.range;
    let start;
    let end;
    if (!range) {
      start = 0;
      end = videoSize - 1;
    } else {
      // Parse Range
      // Example: "bytes=32324-"
      const CHUNK_SIZE = 10 ** 6; // 1MB
      start = Number(range.replace(/\D/g, ""));
      end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    }

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  console.log(`piping bytes: ${start} - ${end}`);

  // Stream the video chunk to the client
  videoStream.pipe(res);
  }
}
