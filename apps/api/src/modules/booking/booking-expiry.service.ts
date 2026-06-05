import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@infra/prisma/prisma.service';
import { StripeService } from '@infra/stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { EnvKey } from '@event-space/shared/enums';

// Time in seconds after which a PENDING booking is considered expired
// Default kept for backward compatibility, actual value is read from ConfigService
const DEFAULT_RESERVATION_TTL_SECONDS = 120; // 2 minutes

@Injectable()
export class BookingExpiryService {
	private readonly logger = new Logger(BookingExpiryService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
		private readonly config: ConfigService,
	) {}

	// Run every minute
	@Cron('*/1 * * * *')
	async handleExpiry() {
		const ttl = Number(
			this.config.get(EnvKey.BOOKING_RESERVATION_TTL_SECONDS) ?? DEFAULT_RESERVATION_TTL_SECONDS,
		);
		const cutoff = new Date(Date.now() - ttl * 1000);

		// Find a small batch of expired pending bookings
		const expired = await this.prisma.booking.findMany({
			where: { status: 'PENDING', createdAt: { lt: cutoff } },
			take: 50,
		});

		if (expired.length === 0) return;

		this.logger.log(`Expiring ${expired.length} pending bookings older than ${cutoff.toISOString()}`);

		for (const b of expired) {
			try {
				await this.prisma.$transaction(async (tx) => {
					// Release event spots
					await tx.event.updateMany({
						where: { id: b.eventId, currentParticipants: { gte: b.quantity } },
						data: { currentParticipants: { decrement: b.quantity } },
					});

					// Mark booking cancelled and clear paymentIntentId
					await tx.booking.update({
						where: { id: b.id },
						data: { status: 'CANCELLED', paymentIntentId: null },
					});
				});

				// best-effort: cancel stripe payment intent if exists
				if (b.paymentIntentId) {
					try {
						await this.stripe.cancelPaymentIntent(b.paymentIntentId, `expiry-${b.id}`);
					} catch (e) {
						this.logger.warn(
							`Failed to cancel payment intent ${b.paymentIntentId} for expired booking ${b.id}`,
						);
					}
				}
			} catch (e) {
				this.logger.error(`Failed to expire booking ${b.id}`, e as Error);
			}
		}
	}
}
