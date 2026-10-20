import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingTopUpService } from '../use-cases/booking-top-up.service';

@Injectable()
export class BookingTopUpJobService {
	private readonly logger = new Logger(BookingTopUpJobService.name);

	constructor(private readonly topUps: BookingTopUpService) {}

	@Cron(CronExpression.EVERY_MINUTE)
	async settleStalePayments() {
		try {
			const handled = await this.topUps.sweep();
			if (handled > 0) this.logger.log(`Settled ${handled} guest payments`);
		} catch (error) {
			this.logger.error('Failed to settle guest payments', error as Error);
		}
	}
}
