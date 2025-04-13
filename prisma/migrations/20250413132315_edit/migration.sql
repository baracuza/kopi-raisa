/*
  Warnings:

  - You are about to drop the column `published_at` on the `News` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "News" DROP COLUMN "published_at",
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;
