import { Playlist, PlaylistPosition } from "@prisma/client";
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, ValidateIf, ValidateNested } from "class-validator";

export interface PlaylistDto extends Pick<Playlist, "title"> {
    playlistPosition: PlaylistPositionDto[];
}

export class PlaylistPositionDto implements Omit<PlaylistPosition, "playlistId"> {
    @IsNotEmpty()
    videoId: string;

    @IsNotEmpty()
    position: number;
}

export class PlaylistCreateDto implements PlaylistDto {
    @IsNotEmpty()
    title: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => PlaylistPositionDto)
    playlistPosition: PlaylistPositionDto[];
}

export class PlaylistUpdateDto implements PlaylistDto {
    @IsOptional()
    title: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => PlaylistPositionDto)
    playlistPosition: PlaylistPositionDto[];
}