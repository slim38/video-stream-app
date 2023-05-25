import { ReadStream } from "fs";

/**
 * Holds Readstream of video partial and metadata
 */
export interface PartialVideoData {
    end: number,
    start: number,
    videoSize: number,
    stream: ReadStream
}