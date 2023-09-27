import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Logger, OnModuleInit, Param, ParseFilePipe, ParseFilePipeBuilder, Post, Req, Res, UploadedFile, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response, response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { createWriteStream } from 'fs';
import { VideoUploadMetadataDTO } from './models/video-upload-metadata.interface';
import { VideoFileValidator } from './validators/video-file-validator';

@Controller('videos')
export class AppController {
  constructor(
    private readonly appService: AppService,
    ) { }
  private readonly logger = new Logger(AppController.name);

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(':id')
  getTestVideo(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    const range = req.headers.range;

    const videoData = this.appService.getPartialVideoData(id, range);

    const contentLength = videoData.end - videoData.start + 1;
    const headers = {
      "Content-Range": `bytes ${videoData.start}-${videoData.end}/${videoData.videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/webm",
    };

    res.writeHead(206, headers);

    videoData.stream.pipe(res);
  }

  @Post('uploadTest')
  @HttpCode(201)
  async uploadFile(@Req() request: Request, @Res() response: Response) {
    const writeFile = createWriteStream('./videos/uploaded1.mp4');
    request.on('end', () => { response.send() });
    request.pipe(writeFile);
  }

  @Post()
  @HttpCode(201)
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
    this.appService.saveAndPublishVideo(file, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    return this.appService.deleteVideo(id);
  }
}
