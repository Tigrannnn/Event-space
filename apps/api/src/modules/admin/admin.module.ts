import { Module } from '@nestjs/common';
import { AdminUsersService } from './users/admin-users.service';
import { AdminBookingsService } from './bookings/admin-bookings.service';
import { AdminBookingCancellationService } from './bookings/admin-booking-cancellation.service';
import { AdminEventsService } from './events/admin-events.service';
import { AdminCategoriesService } from './categories/admin-categories.service';
import { DashboardStatsService } from './dashboard/dashboard-stats.service';
import { AdminController } from './admin.controller';
import { DashboardSnapshotService } from './dashboard/dashboard-snapshot.service';
import { DashboardFlowService } from './dashboard/dashboard-flow.service';
import { DashboardRevenueService } from './dashboard/dashboard-revenue.service';
import { BookingStatusHistoryService } from './dashboard/booking-status-history.service';
import { EventModule } from '@modules/event/event.module';
import { BookingModule } from '@modules/booking/booking.module';
import { StripeModule } from '@infra/stripe/stripe.module';

@Module({
	imports: [EventModule, BookingModule, StripeModule],
	controllers: [AdminController],
	providers: [
		AdminUsersService,
		AdminBookingsService,
		AdminBookingCancellationService,
		AdminEventsService,
		AdminCategoriesService,
		DashboardStatsService,
		DashboardSnapshotService,
		DashboardFlowService,
		DashboardRevenueService,
		BookingStatusHistoryService,
	],
})
export class AdminModule {}
