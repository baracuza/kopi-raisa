-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "weight" INTEGER;

-- AlterTable
ALTER TABLE "ShippingAddress" ADD COLUMN     "origin_city" TEXT,
ADD COLUMN     "origin_district" TEXT,
ADD COLUMN     "origin_id" INTEGER,
ADD COLUMN     "origin_province" TEXT,
ADD COLUMN     "origin_subdistrict" TEXT,
ADD COLUMN     "origin_zip_code" TEXT;
