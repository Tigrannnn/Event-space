/*
  Warnings:

  - A unique constraint covering the columns `[reference_number]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "reference_number" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_reference_number_key" ON "bookings"("reference_number");
