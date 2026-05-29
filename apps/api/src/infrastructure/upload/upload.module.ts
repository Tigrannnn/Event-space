import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
	CloudinaryDeleteQueueService,
	CloudinaryDeleteRetryWorker,
	CloudinaryOrphanReconciliationService,
} from './cloudinary';
import { UploadService } from './upload.service';

@Module({
	imports: [ConfigModule],
	providers: [
		UploadService,
		CloudinaryDeleteQueueService,
		CloudinaryDeleteRetryWorker,
		CloudinaryOrphanReconciliationService,
	],
	exports: [UploadService],
})
export class UploadModule {}
