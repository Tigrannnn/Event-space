/*
  Warnings:

  - Made the column `amount` on table `bookings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "amount" SET NOT NULL;
