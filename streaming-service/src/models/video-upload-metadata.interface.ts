import { IsNotEmpty, IsString } from "class-validator";

export interface VideoUploadMetadata {
    title: string;
    description: string;
}

export interface VideoUploadEvent extends VideoUploadMetadata {
    id: string;
}

export class VideoUploadMetadataDTO implements VideoUploadMetadata {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    description: string;
}