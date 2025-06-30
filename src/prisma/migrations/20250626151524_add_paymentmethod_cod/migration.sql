-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'COD';

-- CreateTable
CREATE TABLE "AboutCompany" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutCompanyMedia" (
    "id" SERIAL NOT NULL,
    "about_id" INTEGER NOT NULL,
    "media_url" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isThumbnail" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AboutCompanyMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutVisionMission" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "about_id" INTEGER NOT NULL,

    CONSTRAINT "AboutVisionMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutOrganization" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "about_id" INTEGER NOT NULL,

    CONSTRAINT "AboutOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutTeam" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "about_id" INTEGER NOT NULL,

    CONSTRAINT "AboutTeam_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AboutCompanyMedia" ADD CONSTRAINT "AboutCompanyMedia_about_id_fkey" FOREIGN KEY ("about_id") REFERENCES "AboutCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutVisionMission" ADD CONSTRAINT "AboutVisionMission_about_id_fkey" FOREIGN KEY ("about_id") REFERENCES "AboutCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutOrganization" ADD CONSTRAINT "AboutOrganization_about_id_fkey" FOREIGN KEY ("about_id") REFERENCES "AboutCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutTeam" ADD CONSTRAINT "AboutTeam_about_id_fkey" FOREIGN KEY ("about_id") REFERENCES "AboutCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
