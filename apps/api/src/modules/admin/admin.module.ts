import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { EventModule } from '@modules/event/event.module';
import { BookingModule } from '@modules/booking/booking.module';

@Module({
	imports: [EventModule, BookingModule],
	controllers: [AdminController],
	providers: [AdminService],
})
export class AdminModule {}
