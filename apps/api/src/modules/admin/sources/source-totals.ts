import type { SourceTotals } from '@event-space/shared';
import { classifyBookingRevenue, round2, type RevenueBooking } from '../dashboard/dashboard-revenue.util';

export interface SourceBookingRow {
	sourceId: string | null;
	sourceRef: string | null;
	status: RevenueBooking['status'];
	paymentMethod: RevenueBooking['paymentMethod'];
	amount: unknown;
	quantity: number;
	checkedInAt: Date | null;
	adjustments: { type: string; amount: unknown; feeAmount: unknown; createdAt: Date }[];
	occurrence: { date: Date; event: { duration: number } };
}

export const SOURCE_BOOKING_SELECT = {
	sourceId: true,
	sourceRef: true,
	status: true,
	paymentMethod: true,
	amount: true,
	quantity: true,
	checkedInAt: true,
	adjustments: {
		where: { status: 'SUCCEEDED' as const },
		select: { type: true, amount: true, feeAmount: true, createdAt: true },
	},
	occurrence: { select: { date: true, event: { select: { duration: true } } } },
};

export const NONE_KEY = 'none';

export function emptyTotals(): SourceTotals {
	return { bookings: 0, guests: 0, amount: 0, paid: 0 };
}

export function sourceKey(row: Pick<SourceBookingRow, 'sourceId' | 'sourceRef'>): string {
	if (row.sourceId) return row.sourceId;
	if (row.sourceRef) return `ref:${row.sourceRef}`;
	return NONE_KEY;
}

function paidOf(row: SourceBookingRow, now: Date): number {
	const revenue = classifyBookingRevenue(
		{
			status: row.status,
			paymentMethod: row.paymentMethod,
			amount: Number(row.amount),
			checkedInAt: row.checkedInAt,
			adjustments: row.adjustments.map((adjustment) => ({
				type: adjustment.type as 'CHARGE' | 'REFUND',
				amount: Number(adjustment.amount),
				feeAmount: adjustment.feeAmount === null ? null : Number(adjustment.feeAmount),
				createdAt: adjustment.createdAt,
			})),
		},
		{ date: row.occurrence.date, durationMinutes: row.occurrence.event.duration },
		now,
	);
	return revenue.earned + revenue.expected;
}

export function totalsBySource(rows: SourceBookingRow[], now: Date): Map<string, SourceTotals> {
	const totals = new Map<string, SourceTotals>();

	for (const row of rows) {
		if (row.status !== 'CONFIRMED') continue;

		const key = sourceKey(row);
		const sum = totals.get(key) ?? emptyTotals();
		sum.bookings += 1;
		sum.guests += row.quantity;
		sum.amount = round2(sum.amount + Number(row.amount));
		sum.paid = round2(sum.paid + paidOf(row, now));
		totals.set(key, sum);
	}

	return totals;
}
