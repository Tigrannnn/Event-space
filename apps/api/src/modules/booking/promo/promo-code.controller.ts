import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AccessTokenGuard } from '@modules/auth/guards/access-token.guard';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';
import { AppException, GetCurrentUserId, ZodValidationPipe } from '@shared';
import { AppErrorCode, ApplyPromoCodeSchema } from '@event-space/shared';
import { BOOKING_CONFIG } from '@event-space/shared/constants';
import type { ApplyPromoCodeData } from '@event-space/shared';
import { getReference } from '@infra/swagger/swagger.utils';
import { PromoCodeService } from './promo-code.service';

/**
 * A separate, lightweight check the booking page calls while the customer is still typing a
 * code, so the discounted price can be shown before they commit to paying. It spends nothing —
 * the actual use is only taken inside `BookingCreationService`, in the same transaction that
 * creates the booking.
 */
@ApiTags('promo-codes')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('promo-codes')
export class PromoCodeController {
	constructor(
		private readonly promoCodes: PromoCodeService,
		private readonly prisma: PrismaService,
		private readonly rateLimiter: RateLimiterService,
	) {}

	@Post('validate')
	@ApiOperation({ summary: 'Check a promo code against a tour and preview the discounted price' })
	@ApiBody(getReference('ApplyPromoCodeSchema'))
	async validate(
		@GetCurrentUserId() userId: string,
		@Body(new ZodValidationPipe(ApplyPromoCodeSchema)) data: ApplyPromoCodeData,
	) {
		// Caps scripted guessing of codes: a real typo or two is never blocked, since this
		// counts attempts per logged-in user, not per request.
		await this.rateLimiter.consumePerUser(
			`${BOOKING_CONFIG.KEY_PREFIX}:promo-validate`,
			userId,
			BOOKING_CONFIG.RATE_LIMITS.PROMO_VALIDATE_MAX_PER_WINDOW,
			BOOKING_CONFIG.RATE_LIMITS.PROMO_VALIDATE_WINDOW_SEC,
		);

		const occurrence = await this.prisma.eventOccurrence.findUnique({
			where: { id: data.occurrenceId },
			include: { event: true },
		});

		if (!occurrence || !occurrence.event) {
			throw new AppException(AppErrorCode.OCCURRENCE_NOT_FOUND, { id: data.occurrenceId });
		}

		const promoCode = await this.promoCodes.findApplicable(data.code, occurrence.event);
		await this.promoCodes.assertWithinUserLimit(promoCode, userId);

		const quote = this.promoCodes.quote(
			promoCode,
			occurrence.event.price,
			data.quantity,
			occurrence.discountPercent,
		);

		return {
			promoCodeId: promoCode.id,
			code: promoCode.code,
			discountPercent: quote.discountPercent ?? 0,
			promoCodeDiscountPercent: promoCode.discountPercent,
			baseAmount: quote.baseAmount,
			amount: quote.amount,
		};
	}
}
