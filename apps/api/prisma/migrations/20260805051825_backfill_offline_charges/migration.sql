-- Bookings an admin entered as OFFLINE_PAID took cash at the counter, but until now nothing
-- recorded it: no Stripe webhook fires for them, so they reached the dashboard only through the
-- booking's own `amount`. That made revenue depend on a column that gets overwritten — a
-- cancellation in May rewrote what March earned. `recordOfflinePayment` now writes a CHARGE row
-- when the booking is entered; this backfills the ones entered before it existed.
--
-- The charge is dated `created_at` of the booking, which is when the cash changed hands.
--
-- Cancelled offline bookings are included. The cash was taken; whether any of it was handed back
-- was never recorded anywhere, and inventing a refund would understate the month it was taken in.
--
-- The NOT EXISTS guard matches what recordOfflinePayment counts — a SUCCEEDED adjustment with no
-- payment intent — so a booking the running app has already recorded is skipped rather than
-- charged twice. Stripe-funded rows carry an intent and are left alone.
INSERT INTO "booking_adjustments" (
	id, booking_id, type, amount, currency,
	stripe_payment_intent_id, stripe_refund_id, status, reason, created_at, updated_at
)
SELECT
	gen_random_uuid(),
	b.id,
	'CHARGE'::"AdjustmentType",
	b.amount,
	'AMD',
	NULL,
	NULL,
	'SUCCEEDED'::"AdjustmentStatus",
	'Backfilled: paid offline, entered by an admin before offline payments reached the ledger',
	b.created_at,
	now()
FROM "bookings" b
WHERE b.payment_method = 'OFFLINE_PAID'
	AND b.amount > 0
	AND NOT EXISTS (
		SELECT 1
		FROM "booking_adjustments" a
		WHERE a.booking_id = b.id
			AND a.stripe_payment_intent_id IS NULL
			AND a.status = 'SUCCEEDED'
	);
