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
}
