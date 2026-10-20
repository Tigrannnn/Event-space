-- CreateEnum
CREATE TYPE "ModificationStatus" AS ENUM ('PENDING_PAYMENT', 'APPLIED', 'CANCELLED', 'EXPIRED', 'FAILED');

-- CreateTable
CREATE TABLE "booking_modifications" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "from_quantity" INTEGER NOT NULL,
    "to_quantity" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_intent_id" TEXT,
    "status" "ModificationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "applied_at" TIMESTAMP(3),

    CONSTRAINT "booking_modifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_modifications_payment_intent_id_key" ON "booking_modifications"("payment_intent_id");

-- CreateIndex
CREATE INDEX "booking_modifications_booking_id_idx" ON "booking_modifications"("booking_id");

-- CreateIndex
CREATE INDEX "booking_modifications_status_created_at_idx" ON "booking_modifications"("status", "created_at");

-- AddForeignKey
ALTER TABLE "booking_modifications" ADD CONSTRAINT "booking_modifications_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
