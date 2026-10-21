import { estimateStripeFeeInCents } from '@event-space/shared';

export interface LedgerRow {
	type: 'CHARGE' | 'REFUND';
	status: 'SUCCEEDED' | 'PENDING' | 'FAILED';
	amount: number;
	stripePaymentIntentId: string | null;
	feeAmount: number | null;
	createdAt: Date;
}

export interface CardPayment {
	paymentIntentId: string;
	chargedInCents: number;
	refundedInCents: number;
	feeInCents: number;
	paidAt: Date;
}

export interface BookingPayments {
	cards: CardPayment[];
	cashInCents: number;
	cashRefundedInCents: number;
}

const toCents = (value: number): number => Math.round(value * 100);

const movesMoney = (row: LedgerRow): boolean =>
	row.type === 'CHARGE' ? row.status === 'SUCCEEDED' : row.status !== 'FAILED' && row.amount > 0;

export function readPayments(rows: LedgerRow[]): BookingPayments {
	const cards = new Map<string, CardPayment>();
	let cashInCents = 0;
	let cashRefundedInCents = 0;

	for (const row of rows) {
		if (!movesMoney(row)) continue;

		if (!row.stripePaymentIntentId) {
			if (row.type === 'CHARGE') cashInCents += toCents(row.amount);
			else cashRefundedInCents += toCents(row.amount);
			continue;
		}

		const card = cards.get(row.stripePaymentIntentId) ?? {
			paymentIntentId: row.stripePaymentIntentId,
			chargedInCents: 0,
			refundedInCents: 0,
			feeInCents: 0,
			paidAt: row.createdAt,
		};

		if (row.type === 'CHARGE') {
			card.chargedInCents += toCents(row.amount);
			card.feeInCents +=
				row.feeAmount === null ? estimateStripeFeeInCents(row.amount) : toCents(row.feeAmount);
			if (row.createdAt < card.paidAt) card.paidAt = row.createdAt;
		} else {
			card.refundedInCents += toCents(row.amount);
		}

		cards.set(row.stripePaymentIntentId, card);
	}

	return {
		cards: [...cards.values()].sort((a, b) => a.paidAt.getTime() - b.paidAt.getTime()),
		cashInCents,
		cashRefundedInCents,
	};
}

export function toLedgerRows(
	rows: {
		type: 'CHARGE' | 'REFUND';
		status: 'SUCCEEDED' | 'PENDING' | 'FAILED';
		amount: unknown;
		stripePaymentIntentId: string | null;
		feeAmount: unknown;
		createdAt: Date;
	}[],
): LedgerRow[] {
	return rows.map((row) => ({
		type: row.type,
		status: row.status,
		amount: Number(row.amount),
		stripePaymentIntentId: row.stripePaymentIntentId,
		feeAmount: row.feeAmount === null ? null : Number(row.feeAmount),
		createdAt: row.createdAt,
	}));
}
