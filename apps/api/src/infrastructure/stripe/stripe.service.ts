import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { EnvKey } from '@event-space/shared';
import {
	StripeCharge,
	StripeEvent,
	StripeInstance,
	StripePaymentIntent,
	StripePaymentIntentRetrieve,
	StripeRefund,
} from './stripe.types';

@Injectable()
export class StripeService {
	private stripe: StripeInstance;

	constructor(private readonly config: ConfigService) {
		const stripeSecretKey = this.config.getOrThrow<string>(EnvKey.STRIPE_SECRET_KEY);
		this.stripe = new Stripe(stripeSecretKey);
	}

	async getCharge(chargeId: string): Promise<StripeCharge> {
		return this.stripe.charges.retrieve(chargeId, {
			expand: ['balance_transaction'],
		});
	}

	async createPaymentIntent(
		amount: number,
		currency: string = 'amd',
		metadata?: Record<string, string>,
	): Promise<StripePaymentIntent> {
		// Ensure amount in cents is an integer to avoid floating point issues
		const amountInCents = Math.round(amount * 100);

		return this.stripe.paymentIntents.create({
			amount: amountInCents,
			currency,
			metadata,
		});
	}

	async refund(
		paymentIntentId: string,
		idempotencyKey?: string,
		amount?: number,
	): Promise<StripeRefund> {
		return this.stripe.refunds.create(
			{
				payment_intent: paymentIntentId,
				amount,
			},
			{ idempotencyKey },
		);
	}

	async cancelPaymentIntent(paymentIntentId: string, idempotencyKey?: string): Promise<void> {
		await this.stripe.paymentIntents.cancel(paymentIntentId, undefined, { idempotencyKey });
	}

	async retrievePaymentIntent(paymentIntentId: string): Promise<StripePaymentIntentRetrieve> {
		return this.stripe.paymentIntents.retrieve(paymentIntentId);
	}

	constructWebhookEvent(payload: Buffer, signature: string): StripeEvent {
		const webhookSecret = this.config.getOrThrow<string>(EnvKey.STRIPE_WEBHOOK_SECRET);
		return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
	}
}
