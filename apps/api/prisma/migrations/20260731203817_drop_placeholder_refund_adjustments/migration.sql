-- Cancelling a booking used to write a "refund" row even when nothing was refunded,
-- and stamped it SUCCEEDED — which also misreported refunds that had actually failed
-- at Stripe. The writing code now records a row only on a genuine failure, so these
-- leftover placeholders carry no information: the cancellation is already on the
-- booking status. Rows with a reason are kept — those were written deliberately.
DELETE FROM "booking_adjustments"
WHERE type = 'REFUND'
	AND amount = 0
	AND stripe_refund_id IS NULL
	AND reason IS NULL
	AND status = 'SUCCEEDED';
