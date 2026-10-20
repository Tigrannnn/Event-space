interface PaymentRow {
	type: 'CHARGE' | 'REFUND';
	status: 'SUCCEEDED' | 'PENDING' | 'FAILED';
	amount: number | string;
	stripePaymentIntentId: string | null;
}

export interface PaymentsSummary {
	card: number;
	cash: number;
	refunded: number;
	due: number;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

export function summarizePayments(rows: PaymentRow[], bookingAmount: number): PaymentsSummary {
	let card = 0;
	let cash = 0;
	let refunded = 0;

	for (const row of rows) {
		const amount = Number(row.amount);

		if (row.type === 'CHARGE' && row.status === 'SUCCEEDED') {
			if (row.stripePaymentIntentId) card += amount;
			else cash += amount;
		}

		if (row.type === 'REFUND' && row.status !== 'FAILED') refunded += amount;
	}

	return {
		card: round2(card),
		cash: round2(cash),
		refunded: round2(refunded),
		due: Math.max(0, round2(bookingAmount - (card + cash - refunded))),
	};
}
