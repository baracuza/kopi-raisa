/*
  Warnings:

  - You are about to drop the column `image_url` on the `News` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "News" DROP COLUMN "image_url",
ADD COLUMN     "thumbnail_url" TEXT;

-- AlterTable
ALTER TABLE "NewsMedia" ADD COLUMN     "isThumbnail" BOOLEAN NOT NULL DEFAULT false;
