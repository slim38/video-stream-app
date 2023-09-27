import { Video } from "@prisma/client";
import { IsNotEmpty, IsOptional } from "class-validator";

export class VideoEventDTO implements Video {
    @IsNotEmpty()
    id: string;

    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    description: string;
}