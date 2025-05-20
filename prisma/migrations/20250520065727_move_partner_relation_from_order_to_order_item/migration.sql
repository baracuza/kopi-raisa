/*
  Warnings:

  - You are about to drop the column `partner_id` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_partner_id_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "partner_id";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "partner_id" INTEGER;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
