import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import type {
	DashboardExpectedTimeline,
	DashboardPaymentMix,
	DashboardRevenue,
	DashboardRevenuePoint,
	PaymentMethod,
} from '@event-space/shared';
import { endOfDay, startOfDay, toDateKey } from '../../../shared/utils/app-day.util';
import {
	addBookingRevenue,
	classifyBookingRevenue,
	EMPTY_BOOKING_REVENUE,
	round2,
	tourEndsAt,
	type BookingRevenue,
} from './dashboard-revenue.util';
import { buildExpectedTimeline, type ExpectedBooking } from './dashboard-expected.util';

const DAY_MS = 24 * 60 * 60 * 1000;
const UPCOMING_LOOKBACK_DAYS = 14;

interface TourRow {
	date: Date;
	status: string;
	event: { duration: number };
	bookings: {
		status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
		paymentMethod: PaymentMethod;
		amount: unknown;
		quantity: number;
		checkedInAt: Date | null;
		adjustments: { type: string; amount: unknown; feeAmount: unknown; createdAt: Date }[];
	}[];
}

interface RevenueSummary {
	points: DashboardRevenuePoint[];
	totals: BookingRevenue & { toursFinished: number; toursUpcoming: number };
	paymentMix: DashboardPaymentMix;
}

@Injectable()
export class DashboardRevenueService {
	constructor(private readonly prisma: PrismaService) {}

	async getRevenue(from: string, to: string, now: Date = new Date()): Promise<DashboardRevenue> {
		const start = startOfDay(from);
		const end = endOfDay(to);

		const spanMs = end.getTime() - start.getTime();
		const previousEnd = new Date(start.getTime() - 1);
		const previousStart = new Date(previousEnd.getTime() - spanMs);

		const [current, previous, upcoming] = await Promise.all([
			this.loadTours(start, end),
			this.loadTours(previousStart, previousEnd),
			this.getUpcoming(now),
		]);

		const summary = summarizeTours(current, start, end, now);
		const previousSummary = summarizeTours(previous, previousStart, previousEnd, now);

		return {
			points: summary.points,
			totals: summary.totals,
			paymentMix: summary.paymentMix,
			previousTotals: { earned: previousSummary.totals.earned },
			upcoming,
		};
	}

	async getUpcomingExpected(now: Date = new Date()): Promise<number> {
		const upcoming = await this.getUpcoming(now);
		return upcoming.expected;
	}

	async getExpectedTimeline(
		from: string,
		to: string,
		now: Date = new Date(),
	): Promise<DashboardExpectedTimeline> {
		const since = new Date(startOfDay(from).getTime() - UPCOMING_LOOKBACK_DAYS * DAY_MS);
		const tours = await this.prisma.eventOccurrence.findMany({
			where: { date: { gte: since } },
			select: TIMELINE_SELECT,
		});

		const bookings: ExpectedBooking[] = [];
		for (const tour of tours) {
			for (const booking of tour.bookings) {
				bookings.push({
					status: booking.status,
					cancelledAt: booking.statusHistory[0]?.validFrom ?? null,
					tourDate: tour.date,
					durationMinutes: tour.event.duration,
					adjustments: booking.adjustments.map((row) => ({
						type: row.type,
						amount: Number(row.amount),
						feeAmount: row.feeAmount === null ? null : Number(row.feeAmount),
						createdAt: row.createdAt,
					})),
				});
			}
		}

		return buildExpectedTimeline(bookings, from, to, now);
	}

	private async getUpcoming(now: Date): Promise<DashboardRevenue['upcoming']> {
		const since = new Date(now.getTime() - UPCOMING_LOOKBACK_DAYS * DAY_MS);
		const tours = await this.prisma.eventOccurrence.findMany({
			where: { date: { gte: since } },
			select: TOUR_SELECT,
		});

		let expected = 0;
		let toCollectOnSite = 0;
		let upcomingTours = 0;

		for (const tour of tours) {
			const revenue = revenueOfTour(tour, now);
			expected += revenue.expected;
			toCollectOnSite += revenue.toCollectOnSite;

			const hasGuests = tour.bookings.some((booking) => booking.status === 'CONFIRMED');
			const finished = tourEndsAt({ date: tour.date, durationMinutes: tour.event.duration }) <= now;
			if (tour.status === 'ACTIVE' && hasGuests && !finished) upcomingTours += 1;
		}

		return {
			expected: round2(expected),
			toCollectOnSite: round2(toCollectOnSite),
			tours: upcomingTours,
		};
	}

	private loadTours(from: Date, to: Date): Promise<TourRow[]> {
		return this.prisma.eventOccurrence.findMany({
			where: { date: { gte: from, lte: to } },
			select: TOUR_SELECT,
		});
	}
}

const TOUR_SELECT = {
	date: true,
	status: true,
	event: { select: { duration: true } },
	bookings: {
		select: {
			status: true,
			paymentMethod: true,
			amount: true,
			quantity: true,
			checkedInAt: true,
			adjustments: {
				where: { status: 'SUCCEEDED' as const },
				select: { type: true, amount: true, feeAmount: true, createdAt: true },
			},
		},
	},
};

const TIMELINE_SELECT = {
	date: true,
	event: { select: { duration: true } },
	bookings: {
		select: {
			status: true,
			adjustments: {
				where: { status: 'SUCCEEDED' as const },
				select: { type: true, amount: true, feeAmount: true, createdAt: true },
			},
			statusHistory: {
				where: { status: 'CANCELLED' as const },
				orderBy: { validFrom: 'desc' as const },
				take: 1,
				select: { validFrom: true },
			},
		},
	},
};

type TourBooking = TourRow['bookings'][number];

function toRevenueBooking(booking: TourBooking) {
	return {
		status: booking.status,
		paymentMethod: booking.paymentMethod,
		amount: Number(booking.amount),
		checkedInAt: booking.checkedInAt,
		adjustments: booking.adjustments.map((row) => ({
			type: row.type as 'CHARGE' | 'REFUND',
			amount: Number(row.amount),
			feeAmount: row.feeAmount === null ? null : Number(row.feeAmount),
			createdAt: row.createdAt,
		})),
	};
}

function revenueOfTour(tour: TourRow, now: Date): BookingRevenue {
	const runtime = { date: tour.date, durationMinutes: tour.event.duration };

	return tour.bookings.reduce(
		(sum, booking) =>
			addBookingRevenue(sum, classifyBookingRevenue(toRevenueBooking(booking), runtime, now)),
		EMPTY_BOOKING_REVENUE,
	);
}

const PAYMENT_METHODS: PaymentMethod[] = ['SITE_PAYMENT', 'OFFLINE_PAID', 'PAY_ON_ARRIVAL'];

export function emptyPaymentMix(): DashboardPaymentMix {
	return {
		methods: PAYMENT_METHODS.map((method) => ({
			method,
			bookings: 0,
			guests: 0,
			earned: 0,
			finishedBookings: 0,
			finishedGuests: 0,
			noShowBookings: 0,
			noShowGuests: 0,
			noShowAmount: 0,
		})),
		cancelled: { bookings: 0, earned: 0 },
	};
}

function addToPaymentMix(
	mix: DashboardPaymentMix,
	tour: TourRow,
	booking: TourBooking,
	now: Date,
): void {
	const runtime = { date: tour.date, durationMinutes: tour.event.duration };
	const revenue = classifyBookingRevenue(toRevenueBooking(booking), runtime, now);

	if (booking.status === 'CANCELLED') {
		if (revenue.earned > 0) {
			mix.cancelled.bookings += 1;
			mix.cancelled.earned = round2(mix.cancelled.earned + revenue.earned);
		}
		return;
	}

	if (booking.status !== 'CONFIRMED') return;

	const stat = mix.methods.find((row) => row.method === booking.paymentMethod);
	if (!stat) return;

	stat.bookings += 1;
	stat.guests += booking.quantity;
	stat.earned = round2(stat.earned + revenue.earned);

	if (tourEndsAt(runtime).getTime() > now.getTime()) return;

	stat.finishedBookings += 1;
	stat.finishedGuests += booking.quantity;

	if (booking.checkedInAt) return;

	stat.noShowBookings += 1;
	stat.noShowGuests += booking.quantity;
	stat.noShowAmount = round2(
		stat.noShowAmount + Math.max(0, Number(booking.amount) - revenue.earned),
	);
}

export function summarizeTours(
	tours: TourRow[],
	start: Date,
	end: Date,
	now: Date,
): RevenueSummary {
	const buckets = new Map<string, DashboardRevenuePoint>();

	for (let day = new Date(start); day <= end; day = new Date(day.getTime() + DAY_MS)) {
		const key = toDateKey(day);
		buckets.set(key, { date: key, earned: 0, kept: 0, expected: 0 });
	}

	let total: BookingRevenue = { ...EMPTY_BOOKING_REVENUE };
	let toursFinished = 0;
	let toursUpcoming = 0;
	const paymentMix = emptyPaymentMix();

	for (const tour of tours) {
		const revenue = revenueOfTour(tour, now);

		for (const booking of tour.bookings) {
			addToPaymentMix(paymentMix, tour, booking, now);
		}
		total = addBookingRevenue(total, revenue);

		const point = buckets.get(toDateKey(tour.date));
		if (point) {
			point.earned = round2(point.earned + revenue.earned - revenue.kept);
			point.kept = round2(point.kept + revenue.kept);
			point.expected = round2(point.expected + revenue.expected);
		}

		const hasGuests = tour.bookings.some((booking) => booking.status === 'CONFIRMED');
		if (tour.status === 'ACTIVE' && hasGuests) {
			const finished = tourEndsAt({ date: tour.date, durationMinutes: tour.event.duration }) <= now;
			if (finished) toursFinished += 1;
			else toursUpcoming += 1;
		}
	}

	return {
		points: [...buckets.values()],
		totals: { ...total, toursFinished, toursUpcoming },
		paymentMix,
	};
}
