import { z } from './openapi';
import { BookingWithDetailsSchema } from './booking.schema';
import { SafeUserSchema } from './user.schema';
import { EventSchema } from './event.schema';
import { BookingStatusCountsSchema } from './event-occurrence.schema';
import { DateOnlySchema } from './common.schema';

export const DashboardStatsSchema = z.object({
	totalEvents: z.number(),
	totalUsers: z.number(),
	totalBookings: z.number(),
	confirmedBookings: z.number(),
	pendingBookings: z.number(),
	cancelledBookings: z.number(),
	totalRevenue: z.number(),
	capacityUsageRate: z.number(),
	totalCapacity: z.number(),
	usedCapacity: z.number(),
	events: z.object({
		published: z.number(),
		draft: z.number(),
		cancelled: z.number(),
		upcoming: z.number(),
	}),
	attention: z.object({
		pendingBookings: z.number(),
		draftEvents: z.number(),
		eventsThisWeek: z.number(),
		eventsWithNoBookings: z.number(),
	}),
	recentBookings: z.array(BookingWithDetailsSchema),
	recentUsers: z.array(SafeUserSchema),
	recentEvents: z.array(EventSchema),
	upcomingEvents: z.array(EventSchema),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

/**
 * One finished day of dashboard state, frozen as it stood.
 *
 * Only holds state that nothing else records. Booking counts moved to the status history and
 * revenue to the adjustment ledger — both keep their own dates, so they answer for any day rather
 * than only for days the freeze job happened to run.
 *
 * What remains has no such trail: an event's status and an occurrence's capacity are overwritten
 * in place, so "how many events were published in March" is only answerable if March was frozen.
 */
export const DashboardSnapshotSchema = z.object({
	date: DateOnlySchema,
	totalEvents: z.number(),
	totalUsers: z.number(),
	events: z.object({
		published: z.number(),
		draft: z.number(),
		cancelled: z.number(),
	}),
	totalCapacity: z.number(),
	usedCapacity: z.number(),
});

export type DashboardSnapshot = z.infer<typeof DashboardSnapshotSchema>;

/**
 * How bookings stood at the end of one day, reconstructed from the status history.
 *
 * Unlike a snapshot this is derived, not frozen, and it is still correct for the past: the history
 * keeps the period each booking spent in each status, so a booking confirmed in March and
 * cancelled in May still counts as confirmed on every March day.
 */
export const BookingStatePointSchema = z.object({
	date: DateOnlySchema,
	bookings: BookingStatusCountsSchema,
});

export type BookingStatePoint = z.infer<typeof BookingStatePointSchema>;

/**
 * The bookings created in a period, followed forward to where they ended up.
 *
 * `everConfirmed` is the conversion numerator and cannot be read off the bookings table: a
 * booking confirmed in March and cancelled in May now reads CANCELLED, but it did convert.
 * `current` is the same cohort by its status today, which is a different question and is kept
 * separate on purpose.
 */
export const BookingCohortSchema = z.object({
	created: z.number().int(),
	everConfirmed: z.number().int(),
	attended: z.number().int(),
	current: BookingStatusCountsSchema,
});

export type BookingCohort = z.infer<typeof BookingCohortSchema>;

/** A single day on the flow charts — how much happened that day, not how things stood. */
export const DashboardFlowPointSchema = z.object({
	date: DateOnlySchema,
	bookingsCreated: z.number(),
	revenue: z.number(),
});

export type DashboardFlowPoint = z.infer<typeof DashboardFlowPointSchema>;

/**
 * Flow over a period, next to the same-length period immediately before it.
 *
 * The comparison is what turns a bare number into something actionable — "340 bookings" says
 * nothing on its own, "340, up 12%" does.
 */
export const DashboardFlowSchema = z.object({
	points: z.array(DashboardFlowPointSchema),
	totals: z.object({
		bookingsCreated: z.number(),
		revenue: z.number(),
	}),
	previousTotals: z.object({
		bookingsCreated: z.number(),
		revenue: z.number(),
	}),
});

export type DashboardFlow = z.infer<typeof DashboardFlowSchema>;
