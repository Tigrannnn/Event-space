import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { StripeService } from '../stripe.service';
import { Prisma } from '@prisma/client';

type StripePaymentIntentPayload = {
	id: string;
	amount: number;
	metadata?: {
		bookingId?: string;
	};
};

@Injectable()
export class StripeWebhookService {
	private readonly logger = new Logger(StripeWebhookService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
	) {}

	async handleWebhook(payload: Buffer, signature: string): Promise<void> {
		let event: ReturnType<StripeService['constructWebhookEvent']>;

		try {
			event = this.stripe.constructWebhookEvent(payload, signature);
		} catch (error) {
			this.logger.error('Failed to validate Stripe webhook signature', error as Error);
			throw new BadRequestException('Invalid webhook signature');
		}

		this.logger.log(`Stripe webhook received: ${event.type}`);

		const paymentIntent = event.data.object as StripePaymentIntentPayload;
		const bookingId = paymentIntent.metadata?.bookingId;

		switch (event.type) {
			case 'payment_intent.succeeded':
				await this.handlePaymentSucceeded(bookingId, paymentIntent.id, paymentIntent.amount);
				break;
			case 'payment_intent.payment_failed':
				await this.handlePaymentFailed(bookingId, paymentIntent.id);
				break;
			case 'payment_intent.canceled':
				await this.handlePaymentCanceled(bookingId, paymentIntent.id);
				break;
		}
	}

	private async handlePaymentSucceeded(
		bookingId: string | undefined,
		paymentIntentId: string,
		amountReceived: number,
	): Promise<void> {
		if (!bookingId) {
			this.logger.error(
				`payment_intent.succeeded missing bookingId in metadata. PI: ${paymentIntentId}`,
			);
			return;
		}

		const result = await this.prisma.$transaction(async (tx) => {
			const booking = await tx.booking.findUnique({
				where: { id: bookingId },
				include: { event: { select: { maxParticipants: true } } },
			});

			if (!booking) {
				this.logger.error(`Booking ${bookingId} not found for payment intent ${paymentIntentId}`);
				return { action: 'skipped' as const };
			}

			if (booking.status === 'CANCELLED') {
				this.logger.warn(
					`Booking ${bookingId} was cancelled before payment arrived — issuing full refund`,
				);
				return {
					action: 'refund' as const,
					bookingId,
					paymentIntentId,
					amountReceived,
					idempotencyKey: `auto-refund-cancelled-${bookingId}`,
					reason: 'Payment captured after booking was cancelled.',
				};
			}

			if (booking.status === 'CONFIRMED') {
				this.logger.warn(`Booking ${bookingId} already confirmed, skipping`);
				return { action: 'skipped' as const };
			}

			const reserved = await tx.event.updateMany({
				where: {
					id: booking.eventId,
					currentParticipants: { lte: booking.event.maxParticipants - booking.quantity },
				},
				data: { currentParticipants: { increment: booking.quantity } },
			});

			if (reserved.count === 0) {
				await tx.booking.update({
					where: { id: booking.id },
					data: { status: 'CANCELLED', paymentIntentId },
				});

				this.logger.warn(`No spots left for booking ${bookingId}; issuing automatic refund`);
				return {
					action: 'refund' as const,
					bookingId,
					paymentIntentId,
					amountReceived,
					idempotencyKey: `auto-refund-no-spots-${bookingId}`,
					reason: 'NO_SPOTS_LEFT',
				};
			}

			await tx.booking.update({
				where: { id: bookingId },
				data: { status: 'CONFIRMED', paymentIntentId },
			});

			await tx.bookingAdjustment.create({
				data: {
					bookingId,
					type: 'CHARGE',
					amount: new Prisma.Decimal(booking.amount.toString()),
					currency: 'usd',
					stripePaymentIntentId: paymentIntentId,
					status: 'SUCCEEDED',
					reason: 'Payment captured via webhook',
				},
			});

			return { action: 'confirmed' as const };
		});

		if (result.action === 'refund') {
			try {
				const stripeRefund = await this.stripe.refund(
					result.paymentIntentId,
					result.idempotencyKey,
					result.amountReceived,
				);

				await this.prisma.bookingAdjustment.upsert({
					where: { stripePaymentIntentId: result.paymentIntentId },
					create: {
						bookingId: result.bookingId,
						type: 'REFUND',
						amount: new Prisma.Decimal((stripeRefund.amount / 100).toString()),
						currency: 'usd',
						stripePaymentIntentId: result.paymentIntentId,
						stripeRefundId: stripeRefund.id,
						status: 'SUCCEEDED',
						reason: result.reason,
					},
					update: {
						stripeRefundId: stripeRefund.id,
						status: 'SUCCEEDED',
						reason: result.reason,
					},
				});
			} catch (e) {
				this.logger.error(`Failed to auto-refund booking ${result.bookingId}`, e as Error);
			}

			return;
		}

		if (result.action === 'confirmed') {
			this.logger.log(`Booking ${bookingId} confirmed via webhook`);
		}
	}

	private async handlePaymentFailed(
		bookingId: string | undefined,
		paymentIntentId: string,
	): Promise<void> {
		if (!bookingId) return;

		await this.prisma.$transaction(async (tx) => {
			const booking = await tx.booking.findUnique({ where: { id: bookingId } });

			if (!booking || booking.status !== 'PENDING') {
				this.logger.warn(
					`Booking ${bookingId} not found or not pending for PI ${paymentIntentId} — skipping`,
				);
				return;
			}

			await tx.booking.update({
				where: { id: bookingId },
				data: { status: 'CANCELLED' },
			});
		});

		this.logger.warn(`Booking ${bookingId} cancelled due to failed payment`);
	}

	private async handlePaymentCanceled(
		bookingId: string | undefined,
		paymentIntentId: string,
	): Promise<void> {
		await this.handlePaymentFailed(bookingId, paymentIntentId);
	}
}
