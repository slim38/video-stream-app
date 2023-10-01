import { FileValidator } from "@nestjs/common";
import { FLV_MAGIC_NUMBER, MOV_MAGIV_NUMBER, MP4_MAGIC_NUMBER } from "../app.constants";

export class VideoFileValidator extends FileValidator {
    constructor() {
        super({});
    }
    
    isValid(file?: Express.Multer.File): boolean {
        return file !== null || file !== undefined;
    }

    buildErrorMessage(file: any): string {
        return 'Invalid file type';
    }
}