/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `FacebookAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FacebookAccount_userId_key" ON "FacebookAccount"("userId");
