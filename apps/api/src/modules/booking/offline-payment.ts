import { Prisma } from '@prisma/client';

/**
 * Records cash taken at the counter as a ledger row, the same way a Stripe payment is recorded
 * when its webhook confirms it.
 *
 * Without a row of its own, offline money exists only on the booking — and the booking is the
 * wrong place to read revenue from, because its status is overwritten: a cancellation in May
 * rewrites what March earned. BookingAdjustment rows carry their own dates and are never rewritten.
 *
 * Writes the difference rather than a flat charge, because a manual booking is an upsert: an admin
 * fixing a quantity runs this path a second time for the same booking, and a flat charge would
 * take the money twice. A reduction is recorded as a REFUND, since handing the difference back is
 * what actually happens at the counter.
 *
 * These rows carry no payment intent, which is what keeps them clear of the unique index on
 * (stripe_payment_intent_id, type): Postgres treats NULLs there as distinct from each other.
 */
export async function recordOfflinePayment(
	tx: Prisma.TransactionClient,
	bookingId: string,
	amount: number,
): Promise<void> {
	const recorded = await tx.bookingAdjustment.groupBy({
		by: ['type'],
		where: { bookingId, stripePaymentIntentId: null, status: 'SUCCEEDED' },
		_sum: { amount: true },
	});

	const alreadyTaken = recorded.reduce((sum, row) => {
		const value = Number(row._sum.amount ?? 0);
		return row.type === 'REFUND' ? sum - value : sum + value;
	}, 0);

	const delta = parseFloat((amount - alreadyTaken).toFixed(2));
	if (delta === 0) return;

	await tx.bookingAdjustment.create({
		data: {
			bookingId,
			type: delta > 0 ? 'CHARGE' : 'REFUND',
			amount: new Prisma.Decimal(Math.abs(delta).toFixed(2)),
			currency: 'AMD',
			stripePaymentIntentId: null,
			status: 'SUCCEEDED',
			reason:
				delta > 0
					? 'Paid offline, entered by an admin'
					: 'Offline booking reduced by an admin, difference returned',
		},
	});
}
