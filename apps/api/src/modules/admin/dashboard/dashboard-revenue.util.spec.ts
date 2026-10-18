import {
	classifyBookingRevenue,
	type RevenueBooking,
	type RevenueTour,
} from './dashboard-revenue.util';

const HOUR = 60 * 60 * 1000;
const now = new Date('2026-10-12T12:00:00Z');

const finishedTour: RevenueTour = {
	date: new Date(now.getTime() - 48 * HOUR),
	durationMinutes: 600,
};
const upcomingTour: RevenueTour = {
	date: new Date(now.getTime() + 48 * HOUR),
	durationMinutes: 600,
};

function paid(amount: number, over: Partial<RevenueBooking> = {}): RevenueBooking {
	return {
		status: 'CONFIRMED',
		paymentMethod: 'SITE_PAYMENT',
		amount,
		checkedInAt: null,
		adjustments: [
			{ type: 'CHARGE', amount, feeAmount: null, createdAt: new Date(now.getTime() - 72 * HOUR) },
		],
		...over,
	};
}

function refund(amount: number, at: Date) {
	return { type: 'REFUND' as const, amount, feeAmount: null, createdAt: at };
}

describe('classifyBookingRevenue, kept and lost money', () => {
	it('marks money kept from a cancellation before the tour, apart from earned tours', () => {
		const booking = paid(25000, { status: 'CANCELLED' });
		booking.adjustments.push(refund(15000, now));
		const result = classifyBookingRevenue(booking, upcomingTour, now);
		expect(result).toMatchObject({ earned: 10000, kept: 10000, lost: 0 });
	});

	it('does not call money kept when the tour is already over', () => {
		const booking = paid(25000, { status: 'CANCELLED' });
		booking.adjustments.push(refund(15000, now));
		const result = classifyBookingRevenue(booking, finishedTour, now);
		expect(result).toMatchObject({ earned: 10000, kept: 0, lost: 0 });
	});

	it('reports the fee that stays with the payment provider after a full refund as lost', () => {
		const booking = paid(25000, { status: 'CANCELLED' });
		booking.adjustments[0].feeAmount = 900;
		booking.adjustments.push(refund(25000, now));
		const result = classifyBookingRevenue(booking, upcomingTour, now);
		expect(result).toMatchObject({ earned: -900, kept: 0, lost: 900 });
	});
});

describe('classifyBookingRevenue', () => {
	it('counts a paid booking on a finished tour as earned', () => {
		const result = classifyBookingRevenue(paid(25000), finishedTour, now);
		expect(result).toMatchObject({ earned: 25000, expected: 0 });
	});

	it('counts a paid booking on an upcoming tour as expected, not earned', () => {
		const result = classifyBookingRevenue(paid(25000), upcomingTour, now);
		expect(result).toMatchObject({ earned: 0, expected: 25000 });
	});

	it('takes the Stripe fee off when it is known', () => {
		const booking = paid(25000);
		booking.adjustments[0].feeAmount = 900;
		expect(classifyBookingRevenue(booking, finishedTour, now).earned).toBe(24100);
	});

	it('shows nothing for a booking cancelled and fully refunded before the tour', () => {
		const booking = paid(25000, { status: 'CANCELLED' });
		booking.adjustments.push(refund(25000, now));
		const result = classifyBookingRevenue(booking, upcomingTour, now);
		expect(result).toMatchObject({ earned: 0, expected: 0, refunded: 25000 });
	});

	it('keeps the withheld part of a late cancellation as earned, even before the tour', () => {
		const booking = paid(20000, { status: 'CANCELLED' });
		booking.adjustments.push(refund(10000, now));
		const result = classifyBookingRevenue(booking, upcomingTour, now);
		expect(result).toMatchObject({ earned: 10000, expected: 0, refunded: 10000 });
	});

	it('does not put a refunded booking on a finished tour below zero', () => {
		const booking = paid(25000, { status: 'CANCELLED' });
		booking.adjustments.push(refund(25000, now));
		expect(classifyBookingRevenue(booking, finishedTour, now).earned).toBe(0);
	});

	it('reports a refund made after the tour ended as a correction', () => {
		const booking = paid(25000);
		booking.adjustments.push(refund(5000, new Date(now.getTime() - 6 * HOUR)));
		const result = classifyBookingRevenue(booking, finishedTour, now);
		expect(result).toMatchObject({ earned: 20000, corrections: 5000 });
	});

	it('does not call a refund made before the tour ended a correction', () => {
		const booking = paid(25000);
		booking.adjustments.push(refund(5000, new Date(now.getTime() - 60 * HOUR)));
		expect(classifyBookingRevenue(booking, finishedTour, now).corrections).toBe(0);
	});

	describe('pay on arrival', () => {
		const onArrival = (over: Partial<RevenueBooking> = {}): RevenueBooking => ({
			status: 'CONFIRMED',
			paymentMethod: 'PAY_ON_ARRIVAL',
			amount: 12000,
			checkedInAt: null,
			adjustments: [],
			...over,
		});

		it('is money to collect before the tour', () => {
			const result = classifyBookingRevenue(onArrival(), upcomingTour, now);
			expect(result).toMatchObject({ toCollectOnSite: 12000, earned: 0, expected: 0 });
		});

		it('is earned after the tour once the guest was checked in', () => {
			const booking = onArrival({ checkedInAt: new Date(now.getTime() - 40 * HOUR) });
			expect(classifyBookingRevenue(booking, finishedTour, now).earned).toBe(12000);
		});

		it('is not earned if the guest never showed up', () => {
			const result = classifyBookingRevenue(onArrival(), finishedTour, now);
			expect(result).toMatchObject({ earned: 0, toCollectOnSite: 0 });
		});

		it('is nothing when the booking was cancelled', () => {
			const result = classifyBookingRevenue(onArrival({ status: 'CANCELLED' }), upcomingTour, now);
			expect(result.toCollectOnSite).toBe(0);
		});
	});

	it('treats an offline payment recorded in the ledger like any other charge', () => {
		const booking = paid(8000, { paymentMethod: 'OFFLINE_PAID' });
		expect(classifyBookingRevenue(booking, finishedTour, now).earned).toBe(8000);
	});

	it('ignores a pending booking with nothing paid', () => {
		const booking: RevenueBooking = { ...paid(9000), status: 'PENDING', adjustments: [] };
		expect(classifyBookingRevenue(booking, upcomingTour, now)).toMatchObject({
			earned: 0,
			expected: 0,
		});
	});
});
