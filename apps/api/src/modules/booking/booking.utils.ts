import type { Prisma } from '@prisma/client';
import {
	CHECKIN_CONFIG,
	REVIEW_CONFIG,
	quoteBooking,
	type CancellationPolicyRule,
} from '@event-space/shared';
import { bookingLinkSecret, signBookingLinkToken } from './booking-link-token';
import { checkinTokenSecret, signCheckinToken } from './checkin-token';

/**
 * A QR payload for check-in — null once the booking cannot be checked in at all: cancelled, or
 * past the window. Anything else (PENDING, already checked in) still gets one: the admin sees
 * the real state on the card either way, and a not-yet-confirmed booking that gets paid at the
 * door should not need a second code mailed to it.
 */
export function buildCheckinToken(
	booking: { id: string; status: string },
	occurrenceDate: Date | string | undefined,
	config: { reviewTokenSecret?: string; jwtSecret: string },
): string | null {
	if (booking.status === 'CANCELLED' || !occurrenceDate) return null;

	const expiresAt = new Date(occurrenceDate).getTime() + CHECKIN_CONFIG.EXPIRES_AFTER_EVENT_MS;
	if (expiresAt < Date.now()) return null;

	const secret = checkinTokenSecret(config.reviewTokenSecret, config.jwtSecret);
	return signCheckinToken(booking.id, expiresAt, secret);
}

/**
 * The key to the booking page for someone with no account. It lives until the review window
 * of the tour closes, so one link serves for cancelling before the tour and rating it after.
 */
export function buildBookingLinkToken(
	bookingId: string,
	occurrenceDate: Date | string,
	config: { reviewTokenSecret?: string; jwtSecret: string },
): string {
	const dayMs = 24 * 60 * 60 * 1000;
	const expiresAt = new Date(occurrenceDate).getTime() + (REVIEW_CONFIG.WINDOW_DAYS + 1) * dayMs;

	return signBookingLinkToken(
		bookingId,
		expiresAt,
		bookingLinkSecret(config.reviewTokenSecret, config.jwtSecret),
	);
}

export function nullableNumber(value: Prisma.Decimal | number | null | undefined): number | null {
	return value === null || value === undefined ? null : Number(value);
}

export function priceBooking(
	price: Prisma.Decimal | number,
	discountPercent: number | null | undefined,
	quantity: number,
): { amount: number; baseAmount: number; discountPercent: number | null } {
	const quote = quoteBooking({ price: Number(price), discountPercent }, { quantity });

	return {
		amount: quote.total,
		baseAmount: quote.baseTotal,
		discountPercent: quote.discountPercent || null,
	};
}

export function mapOccurrenceForBookingResponse(
	occurrence: Prisma.EventOccurrenceGetPayload<{
		include: {
			event: {
				include: {
					images: true;
					cancellationRules: true;
					translations: true;
					category: { include: { translations: true } };
					occurrences: true;
				};
			};
		};
	}>,
) {
	return {
		...occurrence,
		event: mapEventForBookingResponse(occurrence.event),
	};
}

export function mapEventForBookingResponse(
	event: Prisma.EventGetPayload<{
		include: {
			images: true;
			cancellationRules: true;
			translations: true;
			category: { include: { translations: true } };
			occurrences: true;
		};
	}>,
) {
	return {
		...event,
		price: Number(event.price),
		images: event.images ?? [],
		cancellationRules: event.cancellationRules ?? [],
		translations: event.translations ?? [],
		category: event.category,
		occurrences: event.occurrences ?? [],
		locationUrl: event.locationUrl ?? null,
	};
}

export function calculateRefundPercentage(
	now: Date,
	eventDate: Date,
	rules: CancellationPolicyRule[],
): number {
	const msLeft = eventDate.getTime() - now.getTime();
	const hoursLeft = msLeft / (1000 * 60 * 60);

	if (hoursLeft <= 0) return 0;

	const sortedRules = [...rules].sort((a, b) => b.hoursBeforeEvent - a.hoursBeforeEvent);

	for (const rule of sortedRules) {
		if (hoursLeft >= rule.hoursBeforeEvent) {
			return rule.refundPercentage;
		}
	}

	return rules.length > 0 ? 0 : 100;
}

export interface RefundPolicy {
	percentage: number;
	withholdStripeFee: boolean;
	reason: 'RULES' | 'RESCHEDULE';
}

export function resolveRefundPolicy(params: {
	now: Date;
	occurrenceDate: Date;
	rules: CancellationPolicyRule[];
	rescheduleRefundUntil?: Date | null;
}): RefundPolicy {
	const { now, occurrenceDate, rules, rescheduleRefundUntil } = params;

	if (rescheduleRefundUntil && now.getTime() <= new Date(rescheduleRefundUntil).getTime()) {
		return { percentage: 100, withholdStripeFee: false, reason: 'RESCHEDULE' };
	}

	return {
		percentage: calculateRefundPercentage(now, occurrenceDate, rules),
		withholdStripeFee: true,
		reason: 'RULES',
	};
}

/**
 * Generates a new booking reference number using a dedicated database counter table.
 * This avoids raw sequence SQL in business logic and keeps the value sequential.
 * The raw value starts at 1; UI formatting pads it to at least 6 digits.
 */
export async function getNextBookingReference(tx: Prisma.TransactionClient): Promise<number> {
	const counter = await tx.bookingReference.create({ data: {} });
	return counter.id;
}
