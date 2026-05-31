import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { EnvKey } from '@event-space/shared';

type StripeInstance = InstanceType<typeof Stripe>;
type StripePaymentIntent = Awaited<ReturnType<StripeInstance['paymentIntents']['create']>>;
type StripeRefund = Awaited<ReturnType<StripeInstance['refunds']['create']>>;
type StripeEvent = ReturnType<StripeInstance['webhooks']['constructEvent']>;

@Injectable()
export class StripeService {
	private stripe: StripeInstance;

	constructor(private readonly config: ConfigService) {
		const stripeSecretKey = this.config.getOrThrow<string>(EnvKey.STRIPE_SECRET_KEY);
		this.stripe = new Stripe(stripeSecretKey);
	}

	async createPaymentIntent(
		amount: number,
		currency: string = 'usd',
		metadata?: Record<string, string>,
	): Promise<StripePaymentIntent> {
		return this.stripe.paymentIntents.create({
			amount: amount * 100,
			currency,
			metadata,
		});
	}

	async refund(paymentIntentId: string): Promise<StripeRefund> {
		return this.stripe.refunds.create({
			payment_intent: paymentIntentId,
		});
	}

	async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
		await this.stripe.paymentIntents.cancel(paymentIntentId);
	}

	constructWebhookEvent(payload: Buffer, signature: string): StripeEvent {
		const webhookSecret = this.config.getOrThrow<string>(EnvKey.STRIPE_WEBHOOK_SECRET);
		return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
	}
}
