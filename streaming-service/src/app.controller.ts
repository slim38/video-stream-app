import { Body, Controller, Get, HttpStatus, Inject, Logger, OnModuleInit, ParseFilePipe, ParseFilePipeBuilder, Post, Req, Res, UploadedFile, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response, response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { createWriteStream } from 'fs';
import { VideoUploadMetadataDTO } from './models/video-upload-metadata.interface';
import { VideoFileValidator } from './validators/video-file-validator';
import { ClientKafka, EventPattern, MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    ) { }
  private readonly logger = new Logger(AppController.name);

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-video')
  getTestVideo(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const range = req.headers.range;

    const videoData = this.appService.getTestVideoRange(range);

    const contentLength = videoData.end - videoData.start + 1;
    const headers = {
      "Content-Range": `bytes ${videoData.start}-${videoData.end}/${videoData.videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    this.logger.log(`Test Endpoint - piping bytes: ${videoData.start} - ${videoData.end}`);
    videoData.stream.pipe(res);
  }

  @Post('uploadTest')
  async uploadFile(@Req() request: Request, @Res() response: Response) {
    const writeFile = createWriteStream('./videos/uploaded1.mp4');
    request.on('end', () => { response.send() });
    request.pipe(writeFile);
  }

  @Post('upload')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('file'))
  uploadFile2(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1000000000 })
        .addValidator(new VideoFileValidator())
        .build({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })
    )
    file: Express.Multer.File,
    @Body() body: VideoUploadMetadataDTO
  ) {
    const fileWriter = createWriteStream(`./${process.env.VIDEO_DIR}/new.mp4`);
    fileWriter.write(file.buffer);
  }
}
