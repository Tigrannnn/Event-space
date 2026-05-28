import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeWebhookController } from './webhook/stripe-webhook.controller';
import { StripeWebhookService } from './webhook/stripe-webhook.service';

@Module({
	providers: [StripeService, StripeWebhookService],
	controllers: [StripeWebhookController],
	exports: [StripeService],
})
export class StripeModule {}
