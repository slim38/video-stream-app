import { Video } from "@prisma/client";
import { IsNotEmpty } from "class-validator";

export class VideoDeleteEventDTO implements Pick<Video, "id"> {
    @IsNotEmpty()
    id: string;
}
