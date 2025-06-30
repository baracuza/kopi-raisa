/*
  Warnings:

  - You are about to drop the column `origin_city` on the `ShippingAddress` table. All the data in the column will be lost.
  - You are about to drop the column `origin_district` on the `ShippingAddress` table. All the data in the column will be lost.
  - You are about to drop the column `origin_id` on the `ShippingAddress` table. All the data in the column will be lost.
  - You are about to drop the column `origin_province` on the `ShippingAddress` table. All the data in the column will be lost.
  - You are about to drop the column `origin_subdistrict` on the `ShippingAddress` table. All the data in the column will be lost.
  - You are about to drop the column `origin_zip_code` on the `ShippingAddress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ShippingAddress" DROP COLUMN "origin_city",
DROP COLUMN "origin_district",
DROP COLUMN "origin_id",
DROP COLUMN "origin_province",
DROP COLUMN "origin_subdistrict",
DROP COLUMN "origin_zip_code",
ADD COLUMN     "destination_city" TEXT,
ADD COLUMN     "destination_district" TEXT,
ADD COLUMN     "destination_id" INTEGER,
ADD COLUMN     "destination_province" TEXT,
ADD COLUMN     "destination_subdistrict" TEXT,
ADD COLUMN     "destination_zip_code" INTEGER;

-- CreateTable
CREATE TABLE "ShippingDetail" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "shipping_name" TEXT,
    "service_name" TEXT,
    "shipping_code" TEXT,
    "shipping_cost" INTEGER,
    "shipping_cashback" INTEGER,
    "shipping_cost_net" INTEGER,
    "service_fee" INTEGER,
    "net_income" INTEGER,
    "etd" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingDetail_order_id_key" ON "ShippingDetail"("order_id");

-- AddForeignKey
ALTER TABLE "ShippingDetail" ADD CONSTRAINT "ShippingDetail_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
