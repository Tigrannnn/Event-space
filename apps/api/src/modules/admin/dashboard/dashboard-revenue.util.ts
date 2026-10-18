export interface RevenueAdjustment {
	type: 'CHARGE' | 'REFUND';
	amount: number;
	feeAmount: number | null;
	createdAt: Date;
}

export interface RevenueBooking {
	status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
	paymentMethod: 'SITE_PAYMENT' | 'OFFLINE_PAID' | 'PAY_ON_ARRIVAL';
	amount: number;
	checkedInAt: Date | null;
	adjustments: RevenueAdjustment[];
}

export interface RevenueTour {
	date: Date;
	durationMinutes: number;
}

export interface BookingRevenue {
	earned: number;
	expected: number;
	refunded: number;
	toCollectOnSite: number;
	corrections: number;
}

const MINUTE_MS = 60 * 1000;

export const EMPTY_BOOKING_REVENUE: BookingRevenue = {
	earned: 0,
	expected: 0,
	refunded: 0,
	toCollectOnSite: 0,
	corrections: 0,
};

export function round2(value: number): number {
	return Math.round(value * 100) / 100;
}

export function tourEndsAt(tour: RevenueTour): Date {
	return new Date(tour.date.getTime() + tour.durationMinutes * MINUTE_MS);
}

export function classifyBookingRevenue(
	booking: RevenueBooking,
	tour: RevenueTour,
	now: Date,
): BookingRevenue {
	const endsAt = tourEndsAt(tour);
	const finished = endsAt.getTime() <= now.getTime();
	const cancelled = booking.status === 'CANCELLED';

	const charges = booking.adjustments.filter((row) => row.type === 'CHARGE');
	const refunds = booking.adjustments.filter((row) => row.type === 'REFUND');

	const collected = charges.reduce((sum, row) => sum + row.amount - (row.feeAmount ?? 0), 0);
	const refunded = refunds.reduce((sum, row) => sum + row.amount, 0);
	const corrections = finished
		? refunds
				.filter((row) => row.createdAt.getTime() > endsAt.getTime())
				.reduce((sum, row) => sum + row.amount, 0)
		: 0;

	if (charges.length === 0 && refunds.length === 0) {
		if (booking.paymentMethod !== 'PAY_ON_ARRIVAL' || booking.status !== 'CONFIRMED') {
			return { ...EMPTY_BOOKING_REVENUE };
		}

		if (finished) {
			return {
				...EMPTY_BOOKING_REVENUE,
				earned: booking.checkedInAt ? round2(booking.amount) : 0,
			};
		}

		return { ...EMPTY_BOOKING_REVENUE, toCollectOnSite: round2(booking.amount) };
	}

	const net = collected - refunded;
	const settled = finished || cancelled;

	return {
		earned: settled ? round2(net) : 0,
		expected: settled ? 0 : round2(net),
		refunded: round2(refunded),
		toCollectOnSite: 0,
		corrections: round2(corrections),
	};
}

export function addBookingRevenue(a: BookingRevenue, b: BookingRevenue): BookingRevenue {
	return {
		earned: round2(a.earned + b.earned),
		expected: round2(a.expected + b.expected),
		refunded: round2(a.refunded + b.refunded),
		toCollectOnSite: round2(a.toCollectOnSite + b.toCollectOnSite),
		corrections: round2(a.corrections + b.corrections),
	};
}
