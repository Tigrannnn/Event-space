import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import type { SourceStats, SourceStatsRow, TourFunnelRow } from '@event-space/shared';
import { endOfDay, startOfDay } from '../../../shared/utils/app-day.util';
import { round2 } from '../dashboard/dashboard-revenue.util';
import { SOURCE_REF } from '@modules/source/source-ref.select';

interface ActivityRow {
	ref: string | null;
	type: string;
	count: bigint | number;
}

type Counts = Omit<SourceStatsRow, 'source'>;

const NONE = '';
const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(from: string, to: string): string[] {
	const days: string[] = [];
	const end = Date.parse(`${to}T00:00:00Z`);
	for (let time = Date.parse(`${from}T00:00:00Z`); time <= end; time += DAY_MS) {
		days.push(new Date(time).toISOString().slice(0, 10));
	}
	return days;
}

function emptyCounts(): Counts {
	return { visitors: 0, viewedTours: 0, startedBooking: 0, bookings: 0, siteBookings: 0, amount: 0 };
}

const ACTIVITY_FIELD: Record<string, 'visitors' | 'viewedTours' | 'startedBooking'> = {
	VISIT: 'visitors',
	TOUR_VIEW: 'viewedTours',
	BOOKING_STARTED: 'startedBooking',
};

@Injectable()
export class AdminAnalyticsService {
	constructor(private readonly prisma: PrismaService) {}

	async sources(from: string, to: string): Promise<SourceStats> {
		const createdAt = { gte: startOfDay(from), lte: endOfDay(to) };

		const [byRef, overall, perDay, bookings, sources, partners] = await Promise.all([
			this.prisma.$queryRaw<ActivityRow[]>(Prisma.sql`
				SELECT source_ref AS ref, type::text AS type, COUNT(DISTINCT visitor_id) AS count
				FROM analytics_events WHERE day BETWEEN ${from} AND ${to}
				GROUP BY source_ref, type`),
			this.prisma.$queryRaw<ActivityRow[]>(Prisma.sql`
				SELECT NULL AS ref, type::text AS type, COUNT(DISTINCT visitor_id) AS count
				FROM analytics_events WHERE day BETWEEN ${from} AND ${to}
				GROUP BY type`),
			this.prisma.analyticsEvent.groupBy({
				by: ['day'],
				where: { type: 'VISIT', day: { gte: from, lte: to } },
				_count: { _all: true },
			}),
			this.prisma.booking.findMany({
				where: { createdAt, status: 'CONFIRMED' },
				select: { sourceId: true, createdByAdminId: true, amount: true },
			}),
			this.prisma.source.findMany(SOURCE_REF),
			this.prisma.source.findMany({ where: { kind: 'PARTNER', isActive: true }, select: { id: true } }),
		]);

		const sourceByCode = new Map(sources.map((source) => [source.code, source]));
		const sourceById = new Map(sources.map((source) => [source.id, source]));
		const rows = new Map<string, Counts>();
		const counts = (key: string) => {
			let current = rows.get(key);
			if (!current) {
				current = emptyCounts();
				rows.set(key, current);
			}
			return current;
		};

		for (const row of byRef) {
			const field = ACTIVITY_FIELD[row.type];
			const source = row.ref ? sourceByCode.get(row.ref) : undefined;
			if (!field || !source) continue;
			counts(source.id)[field] += Number(row.count);
		}

		const totals = emptyCounts();
		for (const row of overall) {
			const field = ACTIVITY_FIELD[row.type];
			if (field) totals[field] = Number(row.count);
		}

		for (const booking of bookings) {
			const amount = Number(booking.amount);
			for (const sum of [counts(booking.sourceId ?? NONE), totals]) {
				sum.bookings += 1;
				if (!booking.createdByAdminId) sum.siteBookings += 1;
				sum.amount = round2(sum.amount + amount);
			}
		}

		for (const partner of partners) counts(partner.id);

		const visitorsByDay = new Map(perDay.map((row) => [row.day, row._count._all]));

		return {
			totals,
			days: daysBetween(from, to).map((date) => ({ date, visitors: visitorsByDay.get(date) ?? 0 })),
			rows: [...rows.entries()]
				.map(([key, sum]) => ({ source: key === NONE ? null : (sourceById.get(key) ?? null), ...sum }))
				.sort(
					(a, b) =>
						Number(a.source === null) - Number(b.source === null) ||
						b.visitors - a.visitors ||
						b.bookings - a.bookings,
				),
		};
	}

	async tours(from: string, to: string, eventId?: string): Promise<TourFunnelRow[]> {
		const eventFilter = eventId ? Prisma.sql`AND event_id = ${eventId}` : Prisma.empty;
		const createdAt = { gte: startOfDay(from), lte: endOfDay(to) };

		const [activity, favorites, bookings] = await Promise.all([
			this.prisma.$queryRaw<{ eventId: string; type: string; count: bigint }[]>(Prisma.sql`
				SELECT event_id AS "eventId", type::text AS type, COUNT(DISTINCT visitor_id) AS count
				FROM analytics_events
				WHERE type IN ('TOUR_VIEW', 'BOOKING_STARTED') AND event_id IS NOT NULL
					AND day BETWEEN ${from} AND ${to} ${eventFilter}
				GROUP BY event_id, type`),
			this.prisma.favorite.groupBy({
				by: ['eventId'],
				where: { createdAt, ...(eventId ? { eventId } : {}) },
				_count: { _all: true },
			}),
			this.prisma.booking.findMany({
				where: {
					createdAt,
					status: 'CONFIRMED',
					createdByAdminId: null,
					...(eventId ? { occurrence: { eventId } } : {}),
				},
				select: { occurrence: { select: { eventId: true } } },
			}),
		]);

		const rows = new Map<string, Omit<TourFunnelRow, 'titles'>>();
		const row = (id: string) => {
			let current = rows.get(id);
			if (!current) {
				current = { eventId: id, views: 0, favorites: 0, started: 0, booked: 0 };
				rows.set(id, current);
			}
			return current;
		};

		for (const item of activity) {
			if (item.type === 'TOUR_VIEW') row(item.eventId).views = Number(item.count);
			else row(item.eventId).started = Number(item.count);
		}
		for (const item of favorites) row(item.eventId).favorites = item._count._all;
		for (const booking of bookings) row(booking.occurrence.eventId).booked += 1;

		if (eventId) row(eventId);

		const events = await this.prisma.event.findMany({
			where: { id: { in: [...rows.keys()] } },
			select: { id: true, translations: { select: { locale: true, title: true } } },
		});
		const titles = new Map(events.map((event) => [event.id, event.translations]));

		return [...rows.values()]
			.filter((item) => titles.has(item.eventId))
			.map((item) => ({ ...item, titles: titles.get(item.eventId) ?? [] }))
			.sort((a, b) => b.views - a.views || b.booked - a.booked);
	}
}
