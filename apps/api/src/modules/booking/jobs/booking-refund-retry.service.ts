import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingRefundService } from '../money/booking-refund.service';

@Injectable()
export class BookingRefundRetryService {
	private readonly logger = new Logger(BookingRefundRetryService.name);
	private running = false;

	constructor(private readonly refunds: BookingRefundService) {}

	@Cron(CronExpression.EVERY_MINUTE)
	async retryQueuedRefunds() {
		if (this.running) return;
		this.running = true;

		try {
			const handled = await this.refunds.retryQueued();
			if (handled > 0) this.logger.log(`Retried ${handled} queued refunds`);
		} catch (error) {
			this.logger.error('Queued refund retry failed', error as Error);
		} finally {
			this.running = false;
		}
	}
}
