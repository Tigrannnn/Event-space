/*
  Warnings:

  - Made the column `category_id` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "events" ALTER COLUMN "category_id" SET NOT NULL;
