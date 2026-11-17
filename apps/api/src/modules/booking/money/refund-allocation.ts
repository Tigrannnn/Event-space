import type { BookingPayments } from './booking-money';

export interface RefundPart {
	paymentIntentId: string | null;
	amountInCents: number;
}

export interface GuestRefund {
	percentage: number;
	grossInCents: number;
	feeInCents: number;
	netInCents: number;
	paidByCard: boolean;
	parts: RefundPart[];
}

export function planGuestRefund(params: {
	payments: BookingPayments;
	guests: number;
	unitPriceInCents: number;
	percentage: number;
	withholdFee: boolean;
}): GuestRefund {
	const { payments, guests, unitPriceInCents, percentage, withholdFee } = params;

	const chargedInCents = payments.cards.reduce((sum, card) => sum + card.chargedInCents, 0);
	const feeTotalInCents = payments.cards.reduce((sum, card) => sum + card.feeInCents, 0);

	const grossPerGuest = Math.round((unitPriceInCents * percentage) / 100);
	const feePerGuest =
		withholdFee && chargedInCents > 0
			? Math.round((feeTotalInCents * unitPriceInCents) / chargedInCents)
			: 0;
	const netPerGuest = Math.max(0, grossPerGuest - feePerGuest);

	const parts: RefundPart[] = [];
	let left = guests * netPerGuest;

	if (payments.cards.length > 0) {
		for (const card of [...payments.cards].reverse()) {
			if (left <= 0) break;
			const amount = Math.min(left, card.chargedInCents - card.refundedInCents);
			if (amount <= 0) continue;
			parts.push({ paymentIntentId: card.paymentIntentId, amountInCents: amount });
			left -= amount;
		}
	} else {
		const amount = Math.min(left, payments.cashInCents - payments.cashRefundedInCents);
		if (amount > 0) {
			parts.push({ paymentIntentId: null, amountInCents: amount });
			left -= amount;
		}
	}

	const grossInCents = guests * grossPerGuest;
	const netInCents = parts.reduce((sum, part) => sum + part.amountInCents, 0);

	return {
		percentage,
		grossInCents,
		feeInCents: Math.min(grossInCents, guests * feePerGuest),
		netInCents,
		paidByCard: payments.cards.length > 0,
		parts,
	};
}

export interface CompensationPlan {
	/** What could actually be covered — less than the request if the booking doesn't have
	 *  that much left to give back. */
	netInCents: number;
	parts: RefundPart[];
}

/**
 * Spreads a flat admin-chosen amount across whatever is still refundable, newest payment
 * first — the same order `planGuestRefund` uses, so a top-up is given back before the
 * original charge it topped up.
 */
export function planCompensation(payments: BookingPayments, amountInCents: number): CompensationPlan {
	const parts: RefundPart[] = [];
	let left = amountInCents;

	if (payments.cards.length > 0) {
		for (const card of [...payments.cards].reverse()) {
			if (left <= 0) break;
			const available = card.chargedInCents - card.refundedInCents;
			const amount = Math.min(left, available);
			if (amount <= 0) continue;
			parts.push({ paymentIntentId: card.paymentIntentId, amountInCents: amount });
			left -= amount;
		}
	} else {
		const available = payments.cashInCents - payments.cashRefundedInCents;
		const amount = Math.min(left, available);
		if (amount > 0) {
			parts.push({ paymentIntentId: null, amountInCents: amount });
			left -= amount;
		}
	}

	return { netInCents: amountInCents - left, parts };
}
