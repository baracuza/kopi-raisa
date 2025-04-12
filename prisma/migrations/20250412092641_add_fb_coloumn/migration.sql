/*
  Warnings:

  - A unique constraint covering the columns `[facebook_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "facebook_id" TEXT,
ADD COLUMN     "fbAccessToken" TEXT,
ADD COLUMN     "fbPageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_facebook_id_key" ON "User"("facebook_id");
