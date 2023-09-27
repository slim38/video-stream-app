import { Video } from "@prisma/client";
import { IsOptional } from "class-validator";

export class VideoUpdateDto implements Pick<Video, "description" | "title"> {
    @IsOptional()
    description: string;
    
    @IsOptional()
    title: string;
}