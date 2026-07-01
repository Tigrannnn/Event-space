/*
  Warnings:

  - You are about to drop the column `current_participants` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `max_participants` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "event_occurrences" ADD COLUMN     "current_participants" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "max_participants" INTEGER NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "current_participants",
DROP COLUMN "max_participants";
