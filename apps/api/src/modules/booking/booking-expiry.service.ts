import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/prisma/prisma.service';
import { StripeService } from '@infra/stripe/stripe.service';
import { BookingService } from '@modules/booking/booking.service';

@Injectable()
export class BookingExpiryService {
	private readonly logger = new Logger(BookingExpiryService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
		private readonly bookingService: BookingService,
	) {}

	@Cron(CronExpression.EVERY_MINUTE)
	async reconcileStalePendingBookings() {
		const cutoff = new Date(Date.now() - 60 * 1000);
		// Unpaid bookings stay PENDING for up to a month; only recent attempts are worth polling
		// Stripe for every minute. Older ones are still settled by the webhook.
		const recentSince = new Date(Date.now() - 24 * 60 * 60 * 1000);
		const pendingBookings = await this.prisma.booking.findMany({
			where: {
				status: 'PENDING',
				expired: false,
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

	// Daily, so a pending booking is expired soon after it turns a month old. Uses updatedAt,
	// not createdAt: re-booking reuses the same row, and a fresh attempt on a months-old row
	// must not be expired right away.
	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async handleExpiry() {
		const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
		const expired = await this.prisma.booking.findMany({
			where: { status: 'PENDING', expired: false, updatedAt: { lt: cutoff } },
			take: 50,
		});

		if (expired.length === 0) return;

		this.logger.log(`Expiring ${expired.length} pending bookings`);

		for (const b of expired) {
			try {
				// Skip if user is actively confirming payment right now
				if (b.paymentIntentId) {
					try {
						const intent = await this.stripe.retrievePaymentIntent(b.paymentIntentId);
						if (intent.status === 'processing' || intent.status === 'requires_confirmation') {
							this.logger.log(
								`Skipping booking ${b.id} — PaymentIntent is ${intent.status}`,
							);
							continue;
						}
					} catch {
						// If retrieval fails, fall through and expire as usual
					}
				}

				const paymentIntentId = await this.prisma.$transaction(async (tx) => {
					// Re-fetch inside transaction to get row-level lock
					const booking = await tx.booking.findUnique({ where: { id: b.id } });

					if (!booking || booking.status !== 'PENDING' || booking.expired) {
						// Already cancelled/expired by user or another cron run — skip
						return null;
					}

					await tx.booking.update({
						where: { id: booking.id },
						data: { status: 'EXPIRED', expired: true, paymentIntentId: null },
					});

					return booking.paymentIntentId;
				});

				if (paymentIntentId) {
					try {
						await this.stripe.cancelPaymentIntent(paymentIntentId, `expiry-${b.id}`);
					} catch {
						this.logger.warn(
							`Failed to cancel payment intent ${paymentIntentId} for expired booking ${b.id}`,
						);
					}
				}
			} catch (e) {
				this.logger.error(`Failed to expire booking ${b.id}`, e as Error);
			}
		}
	}
}