/*
  Warnings:

  - You are about to drop the column `address` on the `Partner` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Partner" DROP COLUMN "address",
ADD COLUMN     "origin_city" TEXT,
ADD COLUMN     "origin_district" TEXT,
ADD COLUMN     "origin_id" INTEGER,
ADD COLUMN     "origin_province" TEXT,
ADD COLUMN     "origin_subdistrict" TEXT,
ADD COLUMN     "origin_zip_code" TEXT;
