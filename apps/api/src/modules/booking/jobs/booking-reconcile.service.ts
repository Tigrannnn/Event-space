import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/prisma/prisma.service';
import { BookingService } from '@modules/booking/booking.service';

/**
 * Safety net for a Stripe webhook that never arrived: recent pending bookings are checked against
 * their payment intent, so a paid booking does not sit in PENDING. Pending bookings never expire.
 */
@Injectable()
export class BookingReconcileService {
	private readonly logger = new Logger(BookingReconcileService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly bookingService: BookingService,
	) {}

	@Cron(CronExpression.EVERY_MINUTE)
	async reconcileStalePendingBookings() {
		const cutoff = new Date(Date.now() - 60 * 1000);
		// Unpaid bookings stay PENDING indefinitely; only recent attempts are worth polling
		// Stripe for every minute. Older ones are still settled by the webhook.
		const recentSince = new Date(Date.now() - 24 * 60 * 60 * 1000);
		const pendingBookings = await this.prisma.booking.findMany({
			where: {
				status: 'PENDING',
				paymentIntentId: { not: null },
				createdAt: { lt: cutoff },
				updatedAt: { gte: recentSince },
			},
			orderBy: { updatedAt: 'desc' },
			take: 50,
		});

		if (pendingBookings.length === 0) {
			return;
		}

		this.logger.log(`Reconciling ${pendingBookings.length} stale pending bookings`);

		for (const pending of pendingBookings) {
			try {
				await this.bookingService.reconcilePayment(pending.paymentIntentId!, pending.id);
			} catch (e) {
				this.logger.error(`Failed to reconcile stale booking ${pending.id}`, e as Error);
			}
		}
	}
}
