import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import type { DashboardStats } from '@event-space/shared';
import { bookingInclude, safeUserSelect } from '../common/admin-selects';
import { normalizeBookingResponse } from '../common/booking-response';
import { endOfDay, startOfDay, toDateKey } from '../../../shared/utils/app-day.util';
import { addDaysToKey } from './dashboard-expected.util';

const WEEK_DAYS = 7;
const RECENT_ACTIVITY_LIMIT = 15;

const dashboardEventInclude = {
	cancellationRules: true,
	translations: true,
	category: { include: { translations: true } },
	// Sorted so the dashboard's "next date" is genuinely the nearest one — widgets read
	// occurrences[0] and would otherwise show whichever row the database returned first.
	occurrences: { orderBy: { date: 'asc' as const } },
	organizer: { select: safeUserSelect },
} as const;

@Injectable()
export class DashboardStatsService {
	constructor(private readonly prisma: PrismaService) {}

	async getStats(): Promise<DashboardStats> {
		const now = new Date();
		const today = toDateKey(now);
		const weekStart = startOfDay(today);
		const weekEnd = endOfDay(addDaysToKey(today, WEEK_DAYS - 1));

		const [
			totalEvents,
			totalUsers,
			totalBookings,
			confirmedBookings,
			pendingBookings,
			cancelledBookings,
			publishedEvents,
			draftEvents,
			cancelledEvents,
			upcomingEventsCount,
			eventsThisWeek,
			pendingUsers,
			capacityTotals,
			recentBookings,
			recentUsers,
			recentEvents,
			upcomingEvents,
		] = await Promise.all([
			this.prisma.event.count(),
			this.prisma.user.count(),
			this.prisma.booking.count(),
			this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
			this.prisma.booking.count({ where: { status: 'PENDING' } }),
			this.prisma.booking.count({ where: { status: 'CANCELLED' } }),
			this.prisma.event.count({ where: { status: 'PUBLISHED' } }),
			this.prisma.event.count({ where: { status: 'DRAFT' } }),
			this.prisma.event.count({ where: { status: 'CANCELLED' } }),
			this.prisma.event.count({ where: { occurrences: { some: { date: { gte: now } } } } }),
			this.prisma.event.count({
				where: { occurrences: { some: { date: { gte: weekStart, lte: weekEnd } } } },
			}),
			this.prisma.user.count({ where: { emailVerified: false, isShadow: false } }),
			this.prisma.eventOccurrence.aggregate({
				_sum: { currentParticipants: true, maxParticipants: true },
			}),
			this.prisma.booking.findMany({
				take: RECENT_ACTIVITY_LIMIT,
				orderBy: { createdAt: 'desc' },
				include: bookingInclude,
			}),
			this.prisma.user.findMany({
				take: RECENT_ACTIVITY_LIMIT,
				orderBy: { createdAt: 'desc' },
				select: safeUserSelect,
			}),
			this.prisma.event.findMany({
				take: RECENT_ACTIVITY_LIMIT,
				orderBy: { createdAt: 'desc' },
				include: dashboardEventInclude,
			}),
			this.prisma.event.findMany({
				take: 5,
				where: { occurrences: { some: { date: { gte: now } } } },
				orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
				include: dashboardEventInclude,
			}),
		]);

		const totalCapacity = capacityTotals._sum.maxParticipants ?? 0;
		const usedCapacity = capacityTotals._sum.currentParticipants ?? 0;
		const capacityUsageRate =
			totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;

		const toEventResponse = <
			E extends { price: unknown; cancellationRules: unknown[] | null; occurrences: unknown[] | null },
		>(
			event: E,
		) => ({
			...event,
			price: Number(event.price),
			cancellationRules: event.cancellationRules ?? [],
			occurrences: event.occurrences ?? [],
		});

		return {
			totalEvents,
			totalUsers,
			totalBookings,
			confirmedBookings,
			pendingBookings,
			cancelledBookings,
			capacityUsageRate,
			totalCapacity,
			usedCapacity,
			events: {
				published: publishedEvents,
				draft: draftEvents,
				cancelled: cancelledEvents,
				upcoming: upcomingEventsCount,
			},
			attention: {
				pendingBookings,
				draftEvents,
				eventsThisWeek,
				pendingUsers,
			},
			recentBookings: recentBookings.map((booking) => normalizeBookingResponse(booking)),
			recentUsers,
			recentEvents: recentEvents.map(toEventResponse),
			upcomingEvents: upcomingEvents.map(toEventResponse),
		};
	}
}
