import { Module } from '@nestjs/common';
import { UploadModule } from '@infra/upload/upload.module';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventMutationRateLimitGuard } from './guards/event-mutation-rate-limit.guard';
import { BookingModule } from '../booking/booking.module';

@Module({
	imports: [UploadModule, BookingModule],
	providers: [EventService, EventMutationRateLimitGuard],
	controllers: [EventController],
	exports: [EventService],
})
export class EventModule {}
