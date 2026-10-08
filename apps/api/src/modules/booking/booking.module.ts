import { forwardRef, Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BookingReconcileService } from './booking-reconcile.service';
import { BookingReminderService } from './booking-reminder.service';
import { StripeModule } from '@infra/stripe/stripe.module';

@Module({
	imports: [forwardRef(() => StripeModule)],
	providers: [BookingService, BookingReconcileService, BookingReminderService],
	exports: [BookingService],
	controllers: [BookingController],
})
export class BookingModule {}
