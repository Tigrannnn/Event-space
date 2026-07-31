import { forwardRef, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeWebhookController } from './webhook/stripe-webhook.controller';
import { StripeWebhookService } from './webhook/stripe-webhook.service';
import { BookingModule } from '@modules/booking/booking.module';

@Module({
	imports: [forwardRef(() => BookingModule)],
	providers: [StripeService, StripeWebhookService],
	controllers: [StripeWebhookController],
	exports: [StripeService],
})
export class StripeModule {}
