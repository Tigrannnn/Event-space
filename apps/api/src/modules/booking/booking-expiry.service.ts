import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@infra/prisma/prisma.service';
import { StripeService } from '@infra/stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { EnvKey } from '@event-space/shared/enums';

const DEFAULT_RESERVATION_TTL_SECONDS = 900;

@Injectable()
export class BookingExpiryService {
	private readonly logger = new Logger(BookingExpiryService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
		private readonly config: ConfigService,
	) {}

	@Cron('*/1 * * * *')
	async handleExpiry() {
		const expired = await this.prisma.booking.findMany({
			where: { status: 'PENDING', expiresAt: { lt: new Date() } },
			take: 50,
		});

		if (expired.length === 0) return;

		this.logger.log(`Expiring ${expired.length} pending bookings`);

		for (const b of expired) {
			try {
				let paymentIntentId: string | null = null;

				await this.prisma.$transaction(async (tx) => {
					// Re-fetch inside transaction to get row-level lock
					const booking = await tx.booking.findUnique({ where: { id: b.id } });

					if (!booking || booking.status !== 'PENDING') {
						// Already cancelled by user or another cron run — skip
						return;
					}

					await tx.event.updateMany({
						where: { id: booking.eventId, currentParticipants: { gte: booking.quantity } },
						data: { currentParticipants: { decrement: booking.quantity } },
					});

					await tx.booking.update({
						where: { id: booking.id },
						data: { status: 'CANCELLED', paymentIntentId: null },
					});

					paymentIntentId = booking.paymentIntentId;
				});

				if (paymentIntentId) {
					try {
						await this.stripe.cancelPaymentIntent(paymentIntentId, `expiry-${b.id}`);
					} catch (e) {
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
