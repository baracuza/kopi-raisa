/*
  Warnings:

  - You are about to drop the column `origin_city` on the `Partner` table. All the data in the column will be lost.
  - You are about to drop the column `origin_district` on the `Partner` table. All the data in the column will be lost.
  - You are about to drop the column `origin_id` on the `Partner` table. All the data in the column will be lost.
  - You are about to drop the column `origin_province` on the `Partner` table. All the data in the column will be lost.
  - You are about to drop the column `origin_subdistrict` on the `Partner` table. All the data in the column will be lost.
  - You are about to drop the column `origin_zip_code` on the `Partner` table. All the data in the column will be lost.
  - Changed the type of `title` on the `AboutVisionMission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "VisionMission" AS ENUM ('VISI', 'MISI');

-- AlterTable
ALTER TABLE "AboutVisionMission" DROP COLUMN "title",
ADD COLUMN     "title" "VisionMission" NOT NULL;

-- AlterTable
ALTER TABLE "Partner" DROP COLUMN "origin_city",
DROP COLUMN "origin_district",
DROP COLUMN "origin_id",
DROP COLUMN "origin_province",
DROP COLUMN "origin_subdistrict",
DROP COLUMN "origin_zip_code";
