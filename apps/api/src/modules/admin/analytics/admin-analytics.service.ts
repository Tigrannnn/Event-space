import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import type { TourFunnelRow, TrafficReport } from '@event-space/shared';
import { endOfDay, startOfDay } from '../../../shared/utils/app-day.util';
import { daysBetween } from './analytics-days';

interface CountRow {
	key: string | null;
	count: bigint | number;
}

@Injectable()
export class AdminAnalyticsService {
	constructor(private readonly prisma: PrismaService) {}

	async traffic(from: string, to: string): Promise<TrafficReport> {
		const visitWhere = { type: 'VISIT' as const, day: { gte: from, lte: to } };

		const [visits, perDay, distinct, bySourceRows, sources] = await Promise.all([
			this.prisma.analyticsEvent.count({ where: visitWhere }),
			this.prisma.analyticsEvent.groupBy({ by: ['day'], where: visitWhere, _count: { _all: true } }),
			this.prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
				SELECT COUNT(DISTINCT visitor_id) AS count FROM analytics_events
				WHERE type = 'VISIT' AND day BETWEEN ${from} AND ${to}`),
			this.prisma.$queryRaw<CountRow[]>(Prisma.sql`
				SELECT source_ref AS key, COUNT(DISTINCT visitor_id) AS count FROM analytics_events
				WHERE type = 'VISIT' AND day BETWEEN ${from} AND ${to}
				GROUP BY source_ref`),
			this.prisma.source.findMany({ select: { id: true, code: true, name: true } }),
		]);

		const byDay = new Map(perDay.map((row) => [row.day, row._count._all]));
		const byCode = new Map(sources.map((source) => [source.code, source]));

		return {
			visitors: Number(distinct[0]?.count ?? 0),
			visits,
			points: daysBetween(from, to).map((date) => ({ date, visitors: byDay.get(date) ?? 0 })),
			bySource: bySourceRows
				.map((row) => {
					const source = row.key ? byCode.get(row.key) : undefined;
					return {
						sourceId: source?.id ?? null,
						ref: source ? null : row.key,
						name: source?.name ?? null,
						visitors: Number(row.count),
					};
				})
				.sort((a, b) => b.visitors - a.visitors),
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
