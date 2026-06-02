import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { StripeService } from '../stripe.service';
import { Prisma } from '@prisma/client';

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

		const session = event.data.object as any;
		const bookingId = session.metadata?.bookingId;

		switch (event.type) {
			case 'payment_intent.succeeded':
				await this.handlePaymentSucceeded(bookingId, session.id);
				break;
			case 'payment_intent.payment_failed':
				await this.handlePaymentFailed(bookingId, session.id);
				break;
			case 'payment_intent.canceled':
				await this.handlePaymentCanceled(bookingId, session.id);
				break;
		}
	}

	private async handlePaymentSucceeded(
		bookingId: string | undefined,
		paymentIntentId: string,
	): Promise<void> {
		if (!bookingId) {
			this.logger.error(
				`payment_intent.succeeded missing bookingId in metadata. PI: ${paymentIntentId}`,
			);
			return;
		}

		await this.prisma.$transaction(async (tx) => {
			const booking = await tx.booking.findUnique({ where: { id: bookingId } });

			if (!booking) {
				this.logger.error(`Booking ${bookingId} not found for successful payment`);
				return;
			}

			if (booking.status === 'CONFIRMED') return;

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
		});

		this.logger.log(`Booking ${bookingId} successfully CONFIRMED via webhook`);
	}

	private async handlePaymentFailed(
		bookingId: string | undefined,
		paymentIntentId: string,
	): Promise<void> {
		if (!bookingId) return;

		await this.prisma.$transaction(async (tx) => {
			const booking = await tx.booking.findUnique({ where: { id: bookingId } });
			if (!booking || booking.status === 'CANCELLED') return;

			await tx.booking.update({
				where: { id: bookingId },
				data: { status: 'CANCELLED' },
			});

			// Возвращаем места обратно ивенту
			await tx.event.update({
				where: { id: booking.eventId },
				data: { currentParticipants: { decrement: booking.quantity } },
			});
		});

		this.logger.warn(`Booking ${bookingId} CANCELLED due to failed payment`);
	}

	private async handlePaymentCanceled(
		bookingId: string | undefined,
		paymentIntentId: string,
	): Promise<void> {
		await this.handlePaymentFailed(bookingId, paymentIntentId);
	}
}
