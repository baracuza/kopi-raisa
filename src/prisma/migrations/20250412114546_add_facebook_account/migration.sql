/*
  Warnings:

  - You are about to drop the column `facebook_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fbAccessToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fbPageId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_facebook_id_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "facebook_id",
DROP COLUMN "fbAccessToken",
DROP COLUMN "fbPageId";

-- CreateTable
CREATE TABLE "FacebookAccount" (
    "id" TEXT NOT NULL,
    "facebook_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "token_expires" TIMESTAMP(3) NOT NULL,
    "page_id" TEXT NOT NULL,
    "page_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "email" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacebookAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacebookAccount_facebook_id_key" ON "FacebookAccount"("facebook_id");

-- CreateIndex
CREATE UNIQUE INDEX "FacebookAccount_userId_key" ON "FacebookAccount"("userId");

-- AddForeignKey
ALTER TABLE "FacebookAccount" ADD CONSTRAINT "FacebookAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
