import { FileValidator } from "@nestjs/common";
import { FLV_MAGIC_NUMBER, MOV_MAGIV_NUMBER, MP4_MAGIC_NUMBER } from "../app.constants";

export class VideoFileValidator extends FileValidator {
    constructor() {
        super({});
    }

    private hasMagicNumber(magicNumber: number[] ,buffers: Buffer) : boolean {
        return magicNumber.every((header, index) => header === buffers[index])
    }
    
    isValid(file?: Express.Multer.File): boolean {
        return this.hasMagicNumber(MP4_MAGIC_NUMBER, file.buffer)
            || this.hasMagicNumber(FLV_MAGIC_NUMBER, file.buffer)
            || this.hasMagicNumber(MOV_MAGIV_NUMBER, file.buffer);
    }

    buildErrorMessage(file: any): string {
        return 'Invalid file type';
    }
}