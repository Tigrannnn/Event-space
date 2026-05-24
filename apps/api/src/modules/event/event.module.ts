import { Module } from '@nestjs/common';
import { UploadModule } from '@infra/upload/upload.module';
import { EventService } from './event.service';
import { EventController } from './event.controller';

@Module({
	imports: [UploadModule],
	providers: [EventService],
	controllers: [EventController],
	exports: [EventService],
})
export class EventModule {}
