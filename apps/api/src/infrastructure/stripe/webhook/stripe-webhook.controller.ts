import { Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AppErrorCode } from '@event-space/shared';
import { AppException } from '@shared';
import { StripeWebhookService } from './stripe-webhook.service';

@Controller('webhooks/stripe')
export class StripeWebhookController {
	constructor(private readonly stripeWebhookService: StripeWebhookService) {}

	@Post()
	@HttpCode(200)
	async handleWebhook(
		@Req() req: Request,
		@Headers('stripe-signature') signature: string,
	): Promise<void> {
		const payload = req.body as Buffer;

		if (!payload || !signature) {
			throw new AppException(AppErrorCode.INVALID_WEBHOOK_REQUEST);
		}

		await this.stripeWebhookService.handleWebhook(payload, signature);
	}
}
