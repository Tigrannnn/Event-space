/*
  Warnings:

  - A unique constraint covering the columns `[payment_intent_id]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "payment_intent_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_payment_intent_id_key" ON "bookings"("payment_intent_id");
