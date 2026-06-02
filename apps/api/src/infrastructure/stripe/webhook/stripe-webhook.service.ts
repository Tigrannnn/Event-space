import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { StripeService } from '../stripe.service';

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

		switch (event.type) {
			case 'payment_intent.succeeded':
				await this.handlePaymentSucceeded(event.data.object.id);
				break;
			case 'payment_intent.payment_failed':
				await this.handlePaymentFailed(event.data.object.id);
				break;
		}
	}

	private async handlePaymentSucceeded(paymentIntentId: string): Promise<void> {
		const result = await this.prisma.booking.updateMany({
			where: { paymentIntentId, status: 'PENDING' },
			data: { status: 'CONFIRMED' },
		});

		if (result.count === 0) {
			this.logger.warn(
				`payment_intent.succeeded received for ${paymentIntentId} but no PENDING booking was updated`,
			);
		} else {
			this.logger.log(`payment_intent.succeeded updated ${result.count} booking(s)`);
		}
	}

	private async handlePaymentFailed(paymentIntentId: string): Promise<void> {
		const booking = await this.prisma.booking.findFirst({
			where: { paymentIntentId, status: 'PENDING' },
		});

		if (!booking) {
			this.logger.warn(`No PENDING booking for paymentIntentId: ${paymentIntentId}`);
			return;
		}

		await this.prisma.$transaction(async (tx) => {
			await tx.booking.update({
				where: { id: booking.id },
				data: { status: 'CANCELLED' },
			});

			await tx.event.update({
				where: { id: booking.eventId },
				data: { currentParticipants: { decrement: booking.quantity } },
			});
		});
	}
}
