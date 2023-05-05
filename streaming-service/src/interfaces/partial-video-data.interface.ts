import { ReadStream } from "fs";

export interface PartialVideoData {
    end: number,
    start: number,
    videoSize: number,
    stream: ReadStream
}