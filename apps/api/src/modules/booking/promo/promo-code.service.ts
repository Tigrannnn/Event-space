import { Injectable } from '@nestjs/common';
import { Prisma, PromoCode } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AppException } from '@shared';
import { AppErrorCode } from '@event-space/shared';
import { priceBooking } from '../booking.utils';

type Queryable = PrismaService | Prisma.TransactionClient;

@Injectable()
export class PromoCodeService {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Looks a code up and checks it applies to this tour right now — but does not spend a use.
	 * Call `redeem` inside the same transaction that actually creates the booking, so two
	 * people racing for the last use of a limited code cannot both succeed.
	 */
	async findApplicable(
		code: string,
		event: { id: string; categoryId: string },
		client: Queryable = this.prisma,
	): Promise<PromoCode> {
		const normalized = code.trim().toUpperCase();
		const promoCode = await client.promoCode.findUnique({ where: { code: normalized } });

		if (!promoCode) throw new AppException(AppErrorCode.PROMO_CODE_NOT_FOUND);
		if (!promoCode.active) throw new AppException(AppErrorCode.PROMO_CODE_INACTIVE);

		const now = new Date();
		if (
			(promoCode.validFrom && promoCode.validFrom > now) ||
			(promoCode.validUntil && promoCode.validUntil < now)
		) {
			throw new AppException(AppErrorCode.PROMO_CODE_EXPIRED);
		}

		if (
			(promoCode.eventId && promoCode.eventId !== event.id) ||
			(promoCode.categoryId && promoCode.categoryId !== event.categoryId)
		) {
			throw new AppException(AppErrorCode.PROMO_CODE_NOT_APPLICABLE);
		}

		if (promoCode.maxUses !== null && promoCode.usageCount >= promoCode.maxUses) {
			throw new AppException(AppErrorCode.PROMO_CODE_LIMIT_REACHED);
		}

		return promoCode;
	}

	/** A per-user cap is read-then-checked, not guarded like `redeem` — one person racing
	 *  themselves on their own cap is not worth the complexity a guarded update would add. */
	async assertWithinUserLimit(
		promoCode: PromoCode,
		userId: string,
		client: Queryable = this.prisma,
	): Promise<void> {
		if (promoCode.maxUsesPerUser === null) return;

		const usedByThisUser = await client.booking.count({
			where: { promoCodeId: promoCode.id, userId, status: { not: 'CANCELLED' } },
		});

		if (usedByThisUser >= promoCode.maxUsesPerUser) {
			throw new AppException(AppErrorCode.PROMO_CODE_LIMIT_REACHED);
		}
	}

	/**
	 * The code never stacks with a tour's own discount — the customer gets whichever of the
	 * two is bigger, so a weak code never makes a promoted date worse than it already was.
	 */
	quote(
		promoCode: PromoCode,
		price: Prisma.Decimal | number,
		quantity: number,
		baselineDiscountPercent?: number | null,
	) {
		const effectiveDiscount = Math.max(promoCode.discountPercent, baselineDiscountPercent ?? 0);
		return priceBooking(price, effectiveDiscount, quantity);
	}

	/**
	 * Takes one use of the code, guarded so a code with a limited number of uses cannot be
	 * oversold by two bookings racing each other — the same pattern as seat reservation.
	 */
	async redeem(tx: Prisma.TransactionClient, promoCode: PromoCode): Promise<void> {
		const claimed = await tx.promoCode.updateMany({
			where: {
				id: promoCode.id,
				OR: [{ maxUses: null }, { usageCount: { lt: promoCode.maxUses ?? 0 } }],
			},
			data: { usageCount: { increment: 1 } },
		});

		if (claimed.count === 0) {
			throw new AppException(AppErrorCode.PROMO_CODE_LIMIT_REACHED);
		}
	}
}
