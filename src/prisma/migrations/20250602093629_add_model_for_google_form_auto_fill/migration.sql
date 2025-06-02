/*
  Warnings:

  - Added the required column `field_key` to the `FormField` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormField" ADD COLUMN     "field_key" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "FormEntryValue" (
    "id" SERIAL NOT NULL,
    "form_entry_id" INTEGER NOT NULL,
    "form_field_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "FormEntryValue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FormEntryValue" ADD CONSTRAINT "FormEntryValue_form_entry_id_fkey" FOREIGN KEY ("form_entry_id") REFERENCES "FormEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormEntryValue" ADD CONSTRAINT "FormEntryValue_form_field_id_fkey" FOREIGN KEY ("form_field_id") REFERENCES "FormField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
