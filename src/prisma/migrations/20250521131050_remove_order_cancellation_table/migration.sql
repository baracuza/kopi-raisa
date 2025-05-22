/*
  Warnings:

  - You are about to drop the `OrderCancellation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderCancellation" DROP CONSTRAINT "OrderCancellation_order_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderCancellation" DROP CONSTRAINT "OrderCancellation_user_id_fkey";

-- DropTable
DROP TABLE "OrderCancellation";
