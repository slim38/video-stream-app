import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, InternalServerErrorException, Logger, OnModuleInit, Param, ParseFilePipe, ParseFilePipeBuilder, Post, Req, Res, UploadedFile, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response, response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { createWriteStream } from 'fs';
import { VideoUploadMetadataDTO } from './models/video-upload-metadata.interface';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { MP4_MAGIC_NUMBER, FLV_MAGIC_NUMBER, MOV_MAGIV_NUMBER } from './app.constants';

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

    videoData.stream.pipe(res).on('end', videoData.stream.close);
  }

  @Post('uploadTest')
  @HttpCode(201)
  async uploadFile(@Req() request: Request, @Res() response: Response) {
    const writeFile = createWriteStream('./videos/uploaded1.mp4');
    request.on('end', () => {
      writeFile.close();
      response.send();
    });
    request.pipe(writeFile);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: process.env.VIDEO_DIR,
      filename: (req, file, cb) => {
        cb(null, uuidv4());
      }
    }),
    fileFilter: (req, file, cb) => {
      console.log(file);
      cb(null, file?.mimetype.startsWith('video'));
    }
  }))
  uploadFile2(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() body: VideoUploadMetadataDTO,
  ) {
    this.logger.log('Saving and publishing new Video');
    if (file && file.filename) {
      this.appService.saveAndPublishVideo(file.filename, body);
      return file.filename;
    }
    throw new InternalServerErrorException('Invalid or missing file!')
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    this.logger.log('Deleting Video.');
    return this.appService.deleteVideo(id);
  }
}
