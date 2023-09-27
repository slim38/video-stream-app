-- DropForeignKey
ALTER TABLE "PlaylistPosition" DROP CONSTRAINT "PlaylistPosition_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistPosition" DROP CONSTRAINT "PlaylistPosition_videoId_fkey";

-- AddForeignKey
ALTER TABLE "PlaylistPosition" ADD CONSTRAINT "PlaylistPosition_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistPosition" ADD CONSTRAINT "PlaylistPosition_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
