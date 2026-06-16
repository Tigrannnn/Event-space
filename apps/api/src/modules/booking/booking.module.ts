import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { StripeModule } from '@infra/stripe/stripe.module';

@Module({
	imports: [StripeModule],
	providers: [BookingService],
	exports: [BookingService],
	controllers: [BookingController],
})
export class BookingModule {}
