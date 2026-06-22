/*
  Warnings:

  - You are about to drop the column `category` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `whats_included` on the `events` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('en', 'ru', 'hy');

-- DropIndex
DROP INDEX "events_category_idx";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "category",
DROP COLUMN "description",
DROP COLUMN "location",
DROP COLUMN "title",
DROP COLUMN "whats_included";

-- CreateTable
CREATE TABLE "event_translations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "location" VARCHAR(200) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "whats_included" VARCHAR(1000)[],

    CONSTRAINT "event_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_translations_category_idx" ON "event_translations"("category");

-- CreateIndex
CREATE UNIQUE INDEX "event_translations_event_id_locale_key" ON "event_translations"("event_id", "locale");

-- AddForeignKey
ALTER TABLE "event_translations" ADD CONSTRAINT "event_translations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
