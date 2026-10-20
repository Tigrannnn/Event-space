import type { PaymentPart } from './booking-money';

export interface RefundPart {
	method: 'CARD' | 'OFFLINE';
	paymentIntentId: string | null;
	grossInCents: number;
	netInCents: number;
	feeWithheldInCents: number;
}

export interface RefundAllocation {
	percentage: number;
	consumedInCents: number;
	grossInCents: number;
	netInCents: number;
	feeWithheldInCents: number;
	parts: RefundPart[];
}

export function allocatePartialRefund(params: {
	payments: PaymentPart[];
	removedUnits: number;
	unitPriceInCents: number;
	percentage: number;
	withholdFee?: boolean;
}): RefundAllocation {
	const { payments, removedUnits, unitPriceInCents, percentage, withholdFee = true } = params;

	let remaining = removedUnits * unitPriceInCents;
	const parts: RefundPart[] = [];

	for (const payment of [...payments].reverse()) {
		if (remaining <= 0) break;

		const consumed = Math.min(remaining, payment.capacityInCents);
		if (consumed <= 0) continue;
		remaining -= consumed;

		const grossInCents = Math.round((consumed * percentage) / 100);

		if (payment.method === 'OFFLINE') {
			parts.push({
				method: 'OFFLINE',
				paymentIntentId: null,
				grossInCents,
				netInCents: grossInCents,
				feeWithheldInCents: 0,
			});
			continue;
		}

		const feeLeft = withholdFee ? Math.max(0, payment.feeInCents - payment.feeWithheldInCents) : 0;
		const share = Math.round((feeLeft * consumed) / payment.capacityInCents);
		const feeWithheldInCents = Math.min(grossInCents, share);

		parts.push({
			method: 'CARD',
			paymentIntentId: payment.paymentIntentId,
			grossInCents,
			netInCents: grossInCents - feeWithheldInCents,
			feeWithheldInCents,
		});
	}

	return {
		percentage,
		consumedInCents: removedUnits * unitPriceInCents - remaining,
		grossInCents: parts.reduce((sum, part) => sum + part.grossInCents, 0),
		netInCents: parts.reduce((sum, part) => sum + part.netInCents, 0),
		feeWithheldInCents: parts.reduce((sum, part) => sum + part.feeWithheldInCents, 0),
		parts,
	};
}
