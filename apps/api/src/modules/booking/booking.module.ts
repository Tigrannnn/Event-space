import { forwardRef, Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BookingExpiryService } from './booking-expiry.service';
import { StripeModule } from '@infra/stripe/stripe.module';

@Module({
	imports: [forwardRef(() => StripeModule)],
	providers: [BookingService, BookingExpiryService],
	exports: [BookingService],
	controllers: [BookingController],
})
export class BookingModule {}
