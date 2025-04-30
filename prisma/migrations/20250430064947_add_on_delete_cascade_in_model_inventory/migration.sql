-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_products_id_fkey";

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
