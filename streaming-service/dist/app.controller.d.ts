import { AppService } from './app.service';
import { Request, Response } from 'express';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getTestVideo(req: Request, res: Response): void;
}
