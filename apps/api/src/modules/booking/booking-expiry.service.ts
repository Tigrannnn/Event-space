import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@infra/prisma/prisma.service';
import { StripeService } from '@infra/stripe/stripe.service';

@Injectable()
export class BookingExpiryService {
	private readonly logger = new Logger(BookingExpiryService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
	) {}

	@Cron(CronExpression.EVERY_MINUTE)
	async handleExpiry() {
		const cutoff = new Date(Date.now() - 30 * 60 * 1000);
		const expired = await this.prisma.booking.findMany({
			where: { status: 'PENDING', createdAt: { lt: cutoff } },
			take: 50,
		});

		if (expired.length === 0) return;

		this.logger.log(`Expiring ${expired.length} pending bookings`);

		for (const b of expired) {
			try {
				const paymentIntentId = await this.prisma.$transaction(async (tx) => {
					// Re-fetch inside transaction to get row-level lock
					const booking = await tx.booking.findUnique({ where: { id: b.id } });

					if (!booking || booking.status !== 'PENDING') {
						// Already cancelled by user or another cron run — skip
						return null;
					}

					await tx.booking.update({
						where: { id: booking.id },
						data: { status: 'CANCELLED', paymentIntentId: null },
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
