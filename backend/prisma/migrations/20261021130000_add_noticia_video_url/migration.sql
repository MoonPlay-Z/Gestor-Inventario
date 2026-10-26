-- Noticias con video además de imagen. `videoUrl` admite YouTube/Vimeo o un
-- enlace directo a un archivo (mp4/webm/ogg); la landing decide cómo embeberlo.
ALTER TABLE "noticias" ADD COLUMN "videoUrl" TEXT;
