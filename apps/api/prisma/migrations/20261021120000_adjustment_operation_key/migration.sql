-- An adjustment is now identified by its payment intent, type and the operation that caused it.
-- A booking can be refunded in parts (fewer guests, then a cancellation), so one payment intent may
-- carry several REFUND rows; operation_key tells them apart. Existing rows keep the empty key, so
-- they stay unique per payment intent and type exactly as before.
ALTER TABLE "booking_adjustments" ADD COLUMN "operation_key" TEXT NOT NULL DEFAULT '';

-- The part of a refund that was held back as the payment provider fee. Needed to know how much of
-- the fee is still left to hold back when the rest of the booking is refunded later.
ALTER TABLE "booking_adjustments" ADD COLUMN "fee_withheld" DECIMAL(10,2);

DROP INDEX "booking_adjustments_stripe_payment_intent_id_type_key";
CREATE UNIQUE INDEX "booking_adjustments_stripe_payment_intent_id_type_operation_key"
  ON "booking_adjustments"("stripe_payment_intent_id", "type", "operation_key");
