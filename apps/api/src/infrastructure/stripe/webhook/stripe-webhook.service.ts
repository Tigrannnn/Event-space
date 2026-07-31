import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { StripeService } from '../stripe.service';
import { BookingService } from '../../../modules/booking/booking.service';

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
		private readonly stripe: StripeService,
		private readonly bookingService: BookingService,
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
			case 'payment_intent.payment_failed':
			case 'payment_intent.canceled':
				await this.bookingService.reconcilePayment(paymentIntent.id, bookingId);
				break;
		}
	}
}
