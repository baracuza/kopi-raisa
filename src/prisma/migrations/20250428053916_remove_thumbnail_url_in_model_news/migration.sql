/*
  Warnings:

  - You are about to drop the column `thumbnail_url` on the `News` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "News" DROP COLUMN "thumbnail_url";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "stock";
