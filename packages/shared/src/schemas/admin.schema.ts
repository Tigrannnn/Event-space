import { z } from './openapi';
import { BookingWithDetailsSchema } from './booking.schema';
import { SafeUserSchema } from './user.schema';
import { EventSchema } from './event.schema';

export const DashboardStatsSchema = z.object({
	totalEvents: z.number(),
	totalUsers: z.number(),
	totalBookings: z.number(),
	confirmedBookings: z.number(),
	pendingBookings: z.number(),
	cancelledBookings: z.number(),
	totalRevenue: z.number(),
	bookingConfirmationRate: z.number(),
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
