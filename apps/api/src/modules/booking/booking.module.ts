import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { StripeModule } from '@infra/stripe/stripe.module';
import { BookingExpiryService } from './booking-expiry.service';

@Module({
	imports: [StripeModule],
	providers: [BookingService, BookingExpiryService],
	controllers: [BookingController],
})
export class BookingModule {}
