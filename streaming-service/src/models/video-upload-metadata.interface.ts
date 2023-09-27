import { Optional } from "@nestjs/common";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export interface VideoUploadMetadata {
    title: string;
    description: string;
}

export interface VideoEvent extends VideoUploadMetadata {
    id: string;
}

export class VideoUploadMetadataDTO implements VideoUploadMetadata {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    description: string;
}