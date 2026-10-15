import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingNotificationService } from '../use-cases/booking-notification.service';

@Injectable()
export class BookingConfirmationRetryService {
	private readonly logger = new Logger(BookingConfirmationRetryService.name);
	private running = false;

	constructor(private readonly notifications: BookingNotificationService) {}

	@Cron(CronExpression.EVERY_10_MINUTES)
	async retryUnsentConfirmations() {
		if (this.running) return;
		this.running = true;

		try {
			const attempted = await this.notifications.retryUnsentConfirmations();
			if (attempted > 0) this.logger.log(`Retried ${attempted} unsent booking confirmations`);
		} catch (error) {
			this.logger.error('Unsent confirmation retry failed', error as Error);
		} finally {
			this.running = false;
		}
	}
}
