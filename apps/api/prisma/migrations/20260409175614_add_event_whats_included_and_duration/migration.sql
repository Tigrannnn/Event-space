/*
  Warnings:

  - Added the required column `duration` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "whats_included" VARCHAR(1000)[],
ALTER COLUMN "images" SET DATA TYPE VARCHAR(1000)[];
