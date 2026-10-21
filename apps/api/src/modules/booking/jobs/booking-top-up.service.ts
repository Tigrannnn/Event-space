import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingTopUpService } from '../use-cases/booking-top-up.service';

const LOOK_BACK_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class BookingTopUpJobService {
	private readonly logger = new Logger(BookingTopUpJobService.name);

	constructor(private readonly topUps: BookingTopUpService) {}

	@Cron(CronExpression.EVERY_5_MINUTES)
	async settlePaidGuests() {
		try {
			await this.topUps.sweep(new Date(Date.now() - LOOK_BACK_MS));
		} catch (error) {
			this.logger.error('Failed to settle guest payments', error as Error);
		}
	}
}
