/*
  Warnings:

  - You are about to drop the column `event_id` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `events` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,occurrence_id]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `occurrence_id` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_event_id_fkey";

-- DropIndex
DROP INDEX "bookings_event_id_idx";

-- DropIndex
DROP INDEX "bookings_user_id_event_id_key";

-- DropIndex
DROP INDEX "events_date_idx";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "event_id",
ADD COLUMN     "occurrence_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "date";

-- CreateTable
CREATE TABLE "event_occurrences" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_occurrences_date_idx" ON "event_occurrences"("date");

-- CreateIndex
CREATE INDEX "event_occurrences_event_id_idx" ON "event_occurrences"("event_id");

-- CreateIndex
CREATE INDEX "bookings_occurrence_id_idx" ON "bookings"("occurrence_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_user_id_occurrence_id_key" ON "bookings"("user_id", "occurrence_id");

-- AddForeignKey
ALTER TABLE "event_occurrences" ADD CONSTRAINT "event_occurrences_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_occurrence_id_fkey" FOREIGN KEY ("occurrence_id") REFERENCES "event_occurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
