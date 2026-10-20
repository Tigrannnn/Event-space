export interface MoneyAdjustment {
	type: 'CHARGE' | 'REFUND';
	status: 'SUCCEEDED' | 'PENDING' | 'FAILED';
	amount: number;
	stripePaymentIntentId: string | null;
	feeAmount: number | null;
	feeWithheld: number | null;
	createdAt: Date;
}

export interface PaymentPart {
	paymentIntentId: string | null;
	method: 'CARD' | 'OFFLINE';
	chargedInCents: number;
	refundedInCents: number;
	feeInCents: number;
	feeWithheldInCents: number;
	capacityInCents: number;
	paidAt: Date;
}

export interface BookingMoney {
	payments: PaymentPart[];
	chargedInCents: number;
	refundedInCents: number;
	attributableInCents: number;
	dueInCents: number;
	keptInCents: number;
}

const toCents = (value: number): number => Math.round(value * 100);

export function summarizeBookingMoney(
	adjustments: MoneyAdjustment[],
	amount: number,
): BookingMoney {
	const parts = new Map<string, PaymentPart>();

	for (const row of adjustments) {
		const holdsMoney =
			row.type === 'CHARGE' ? row.status === 'SUCCEEDED' : row.status !== 'FAILED' && row.amount > 0;
		if (!holdsMoney) continue;

		const key = row.stripePaymentIntentId ?? 'offline';
		const part = parts.get(key) ?? {
			paymentIntentId: row.stripePaymentIntentId,
			method: row.stripePaymentIntentId ? ('CARD' as const) : ('OFFLINE' as const),
			chargedInCents: 0,
			refundedInCents: 0,
			feeInCents: 0,
			feeWithheldInCents: 0,
			capacityInCents: 0,
			paidAt: row.createdAt,
		};

		if (row.type === 'CHARGE') {
			part.chargedInCents += toCents(row.amount);
			part.feeInCents += toCents(row.feeAmount ?? 0);
			if (row.createdAt < part.paidAt) part.paidAt = row.createdAt;
		} else {
			part.refundedInCents += toCents(row.amount);
			part.feeWithheldInCents += toCents(row.feeWithheld ?? 0);
		}

		parts.set(key, part);
	}

	const payments = [...parts.values()]
		.map((part) => ({
			...part,
			capacityInCents: Math.max(
				0,
				part.chargedInCents - part.refundedInCents - part.feeWithheldInCents,
			),
		}))
		.sort((a, b) => a.paidAt.getTime() - b.paidAt.getTime());

	const chargedInCents = payments.reduce((sum, part) => sum + part.chargedInCents, 0);
	const refundedInCents = payments.reduce((sum, part) => sum + part.refundedInCents, 0);
	const feeWithheldInCents = payments.reduce((sum, part) => sum + part.feeWithheldInCents, 0);
	const attributableInCents = chargedInCents - refundedInCents - feeWithheldInCents;
	const amountInCents = toCents(amount);

	return {
		payments,
		chargedInCents,
		refundedInCents,
		attributableInCents,
		dueInCents: Math.max(0, amountInCents - attributableInCents),
		keptInCents: Math.max(0, attributableInCents - amountInCents),
	};
}

export function toMoneyAdjustments(
	rows: {
		type: 'CHARGE' | 'REFUND';
		status: 'SUCCEEDED' | 'PENDING' | 'FAILED';
		amount: unknown;
		stripePaymentIntentId: string | null;
		feeAmount: unknown;
		feeWithheld: unknown;
		createdAt: Date;
	}[],
): MoneyAdjustment[] {
	return rows.map((row) => ({
		type: row.type,
		status: row.status,
		amount: Number(row.amount),
		stripePaymentIntentId: row.stripePaymentIntentId,
		feeAmount: row.feeAmount === null ? null : Number(row.feeAmount),
		feeWithheld: row.feeWithheld === null ? null : Number(row.feeWithheld),
		createdAt: row.createdAt,
	}));
}
