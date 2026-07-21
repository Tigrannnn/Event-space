import { Module } from '@nestjs/common';
import { OccurrenceService } from './occurrence.service';
import { OccurrenceController } from './occurrence.controller';
import { BookingModule } from '@modules/booking/booking.module';
import { MailModule } from '@infra/mail/mail.module';

@Module({
  imports: [BookingModule, MailModule],
  providers: [OccurrenceService],
  controllers: [OccurrenceController],
  exports: [OccurrenceService],
})
export class OccurrenceModule {}