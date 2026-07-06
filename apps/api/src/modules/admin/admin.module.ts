import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { EventModule } from '@modules/event/event.module';
import { BookingModule } from '@modules/booking/booking.module';
import { StripeModule } from '@infra/stripe/stripe.module';

@Module({
	imports: [EventModule, BookingModule, StripeModule],
	controllers: [AdminController],
	providers: [AdminService],
})
export class AdminModule {}
