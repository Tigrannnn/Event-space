-- A charge and a refund are two separate movements of money, but the unique index on
-- stripe_payment_intent_id allowed only one row per payment intent. Recording a refund
-- therefore overwrote the charge row in place, leaving rows typed CHARGE that actually
-- carried a refund id — and blocking any later charge on that intent entirely.

-- DropIndex
DROP INDEX "booking_adjustments_stripe_payment_intent_id_key";

-- Split every charge row that a refund had overwritten back into two rows.
-- The overwrite did not preserve the refunded amount, so it is reconstructed as the
-- charge amount: the closest value still derivable from the remaining data.
CREATE TEMP TABLE "_overwritten_charges" AS
SELECT id, booking_id, amount, currency, stripe_payment_intent_id, stripe_refund_id, created_at
FROM "booking_adjustments"
WHERE type = 'CHARGE' AND stripe_refund_id IS NOT NULL;

-- Release the refund id before re-attaching it, so the unique index on it never sees a duplicate.
UPDATE "booking_adjustments"
SET stripe_refund_id = NULL
WHERE id IN (SELECT id FROM "_overwritten_charges");

INSERT INTO "booking_adjustments" (
	id, booking_id, type, amount, currency,
	stripe_payment_intent_id, stripe_refund_id, status, reason, created_at, updated_at
)
SELECT
	gen_random_uuid(),
	booking_id,
	'REFUND'::"AdjustmentType",
	amount,
	currency,
	stripe_payment_intent_id,
	stripe_refund_id,
	'SUCCEEDED'::"AdjustmentStatus",
	'Reconstructed from a charge row a refund had overwritten; amount approximated',
	created_at,
	now()
FROM "_overwritten_charges";

DROP TABLE "_overwritten_charges";

-- CreateIndex
CREATE UNIQUE INDEX "booking_adjustments_stripe_payment_intent_id_type_key" ON "booking_adjustments"("stripe_payment_intent_id", "type");
