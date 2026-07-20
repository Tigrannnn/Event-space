import { Module } from '@nestjs/common';
import { OccurrenceService } from './occurrence.service';
import { OccurrenceController } from './occurrence.controller';

@Module({
  providers: [OccurrenceService],
  controllers: [OccurrenceController]
})
export class OccurrenceModule {}
