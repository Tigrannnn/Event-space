/*
  Warnings:

  - You are about to drop the column `category` on the `event_translations` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "event_translations_category_idx";

-- AlterTable
ALTER TABLE "event_translations" DROP COLUMN "category";

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "category_id" TEXT;

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_translations" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_category_id_locale_key" ON "category_translations"("category_id", "locale");

-- CreateIndex
CREATE INDEX "events_category_id_idx" ON "events"("category_id");

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
