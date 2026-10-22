export const LEDGER_REASON = {
	OFFLINE_PAID: 'Paid offline, entered by an admin',
	OFFLINE_REDUCED: 'Offline booking reduced by an admin, difference returned',
	PAYMENT_CAPTURED: 'Payment captured',
	PAYMENT_CAPTURED_RECORDED_ON_CANCEL: 'Payment captured, recorded when the booking was cancelled',
	PAYMENT_CAPTURED_RECORDED_BEFORE_REFUND: 'Payment captured, recorded before a refund',
	PAYMENT_CAPTURED_THEN_REFUNDED: 'Payment captured, then refunded automatically',
	PAYMENT_CAPTURED_AFTER_CANCEL: 'Payment captured after booking was cancelled.',
	PAID_FOR_ADDED_GUESTS: 'Paid for added guests',
	ADDED_GUESTS_REFUNDED: 'Payment captured for added guests, then refunded',
	BOOKING_CANCELLED_FEE_WITHHELD: 'Booking cancelled. Stripe fee withheld.',
	EVENT_CANCELLED_FULL_REFUND: 'Event cancelled. Full refund.',
	OCCURRENCE_CANCELLED_FULL_REFUND: 'Occurrence cancelled. Full refund.',
	CANCELLED_AFTER_RESCHEDULE: 'Booking cancelled after the tour date was moved. Refunded in full.',
	NO_SPOTS_LEFT: 'NO_SPOTS_LEFT',
} as const;

export type LedgerReasonCode = keyof typeof LEDGER_REASON;

export const quantityChangeReason = (from: number, to: number): string =>
	`Booking changed from ${from} to ${to} guests`;

export const adminCancelReason = (adminId: string, note?: string): string =>
	`Admin ${adminId} cancelled the booking${note ? `: ${note}` : ''}`;

export const manualRefundReason = (reason: string): string =>
	`Refunded by an admin outside Stripe: ${reason}`;

export type LedgerReasonMatch =
	| { code: LedgerReasonCode; note?: undefined; from?: undefined; to?: undefined }
	| { code: 'QUANTITY_CHANGED'; from: number; to: number; note?: undefined }
	| { code: 'ADMIN_CANCELLED'; note?: string; from?: undefined; to?: undefined }
	| { code: 'MANUAL_REFUND'; note?: string; from?: undefined; to?: undefined }
	| null;

const QUANTITY_CHANGED = /^Booking changed from (\d+) to (\d+) guests$/;
const ADMIN_CANCELLED = /^Admin \S+ cancelled the booking(?::\s*(.*))?$/s;
const MANUAL_REFUND = /^Refunded by an admin outside Stripe:\s*(.*)$/s;

export function matchLedgerReason(reason?: string | null): LedgerReasonMatch {
	if (!reason) return null;

	const known = (Object.keys(LEDGER_REASON) as LedgerReasonCode[]).find(
		(code) => LEDGER_REASON[code] === reason,
	);
	if (known) return { code: known };

	const quantity = QUANTITY_CHANGED.exec(reason);
	if (quantity) {
		return { code: 'QUANTITY_CHANGED', from: Number(quantity[1]), to: Number(quantity[2]) };
	}

	const cancelled = ADMIN_CANCELLED.exec(reason);
	if (cancelled) return { code: 'ADMIN_CANCELLED', note: cancelled[1]?.trim() || undefined };

	const refunded = MANUAL_REFUND.exec(reason);
	if (refunded) return { code: 'MANUAL_REFUND', note: refunded[1]?.trim() || undefined };

	return null;
}
