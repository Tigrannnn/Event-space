-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('CHARGE', 'REFUND');

-- CreateEnum
CREATE TYPE "AdjustmentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "booking_adjustments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "type" "AdjustmentType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripe_payment_intent_id" TEXT,
    "stripe_refund_id" TEXT,
    "status" "AdjustmentStatus" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_adjustments_stripe_payment_intent_id_key" ON "booking_adjustments"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_adjustments_stripe_refund_id_key" ON "booking_adjustments"("stripe_refund_id");

-- CreateIndex
CREATE INDEX "booking_adjustments_booking_id_idx" ON "booking_adjustments"("booking_id");

-- AddForeignKey
ALTER TABLE "booking_adjustments" ADD CONSTRAINT "booking_adjustments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
