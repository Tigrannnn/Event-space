const MINUTE_MS = 60 * 1000;

/** The shape the active-booking rule needs, from the API or from the browser. */
export interface ActiveBookingCandidate {
	status: string;
	checkedInAt?: Date | string | null;
	occurrence?: { date: Date | string; event?: { duration?: number | null } | null } | null;
}

/**
 * Bookings still to be attended: paid, not checked in yet, and the tour has not finished.
 *
 * Shared because the badge in the header and the API that feeds it must agree. Counting every
 * CONFIRMED booking instead — which also holds the ones already attended and the ones whose
 * tour is long over — is how the badge used to disagree with the list it links to.
 */
export function isActiveBooking(booking: ActiveBookingCandidate, now: number = Date.now()): boolean {
	if (booking.status !== 'CONFIRMED' || booking.checkedInAt) return false;
	if (!booking.occurrence) return true;

	const durationMs = (booking.occurrence.event?.duration ?? 0) * MINUTE_MS;

	return new Date(booking.occurrence.date).getTime() + durationMs > now;
}

export function countActiveBookings(
	bookings: ActiveBookingCandidate[],
	now: number = Date.now(),
): number {
	return bookings.filter((booking) => isActiveBooking(booking, now)).length;
}

/**
 * What the site needs about someone's bookings on every page: the badge count and the dates
 * they already hold. Deliberately tiny — the full list costs a Stripe call per booking.
 */
export interface MyBookingsSummary {
	activeCount: number;
	confirmedOccurrenceIds: string[];
	/** The same bookings by id, so a button can lead straight to the one it is about. */
	confirmedBookings: { id: string; occurrenceId: string }[];
}

export interface DueOnSiteCandidate {
	status: string;
	paymentMethod: string;
	amount: number | string;
	checkedInAt?: Date | string | null;
	adjustments?: {
		type: string;
		status?: string;
		amount: number | string;
		stripePaymentIntentId?: string | null;
	}[] | null;
}

/**
 * What the guest still has to pay on arrival, or undefined when nothing is left to collect there.
 * An advance paid by hand sits in the ledger as a charge, so the rest is the price minus it.
 */
export function dueOnSiteOf(booking: DueOnSiteCandidate): number | undefined {
	if (booking.paymentMethod !== 'PAY_ON_ARRIVAL' || booking.status !== 'CONFIRMED') return undefined;

	const paid = (booking.adjustments ?? [])
		.filter((row) => row.status === 'SUCCEEDED')
		.reduce((sum, row) => sum + (row.type === 'REFUND' ? -Number(row.amount) : Number(row.amount)), 0);

	const due = Math.round((Number(booking.amount) - paid) * 100) / 100;

	return due > 0 ? due : undefined;
}

/** Cash refunds owed but not handed back yet: the company records them as returned by hand. */
export function cashToReturnOf(booking: Pick<DueOnSiteCandidate, 'adjustments'>): number | undefined {
	const owed = (booking.adjustments ?? [])
		.filter((row) => row.type === 'REFUND' && row.status === 'PENDING' && !row.stripePaymentIntentId)
		.reduce((sum, row) => sum + Number(row.amount), 0);

	return owed > 0 ? Math.round(owed * 100) / 100 : undefined;
}
