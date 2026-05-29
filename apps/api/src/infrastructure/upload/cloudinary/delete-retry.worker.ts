import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CLOUDINARY_CONFIG } from '@event-space/shared';
import { UploadService } from '../upload.service';
import { CloudinaryDeleteQueueService } from './delete-queue.service';

@Injectable()
export class CloudinaryDeleteRetryWorker implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(CloudinaryDeleteRetryWorker.name);
	private readonly config = CLOUDINARY_CONFIG.DELETE_QUEUE;
	private timer?: NodeJS.Timeout;

	constructor(
		private readonly deleteQueue: CloudinaryDeleteQueueService,
		private readonly uploadService: UploadService,
	) {}

	onModuleInit(): void {
		void this.processDueDeletes();
		this.timer = setInterval(() => void this.processDueDeletes(), this.config.PROCESS_INTERVAL_MS);
	}

	onModuleDestroy(): void {
		if (this.timer) {
			clearInterval(this.timer);
		}
	}

	private async processDueDeletes(): Promise<void> {
		try {
			const due = await this.deleteQueue.claimDue();
			if (!due.length) {
				return;
			}

			for (const publicId of due) {
				await this.processOne(publicId);
			}
		} catch (error) {
			this.logger.error('Cloudinary delete retry worker failed', error);
		}
	}

	private async processOne(publicId: string): Promise<void> {
		const deleted = await this.uploadService.tryDeletePublicId(publicId);
		if (deleted) {
			await this.deleteQueue.clearAttemptCount(publicId);
			this.logger.log(`Cloudinary delete succeeded on retry: ${publicId}`);
			return;
		}

		const attempts = await this.deleteQueue.incrementAttemptCount(publicId);
		if (attempts >= this.config.MAX_ATTEMPTS) {
			this.logger.error(
				`Cloudinary delete abandoned after ${attempts} attempts: ${publicId}`,
			);
			await this.deleteQueue.clearAttemptCount(publicId);
			return;
		}

		const delaySec =
			this.config.RETRY_DELAYS_SEC[attempts - 1] ??
			this.config.RETRY_DELAYS_SEC[this.config.RETRY_DELAYS_SEC.length - 1];

		await this.deleteQueue.enqueue(publicId, delaySec);
		this.logger.warn(
			`Cloudinary delete retry scheduled for ${publicId} in ${delaySec}s (attempt ${attempts}/${this.config.MAX_ATTEMPTS})`,
		);
	}
}
