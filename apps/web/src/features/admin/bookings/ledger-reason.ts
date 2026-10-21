import { matchLedgerReason, type LedgerReasonCode } from '@event-space/shared';
import type { useTranslation } from '@/hooks/translation';

type Translate = ReturnType<typeof useTranslation>;
type TranslationKey = Parameters<Translate>[0];

const REASON_KEYS: Record<LedgerReasonCode, TranslationKey> = {
	OFFLINE_PAID: 'admin.reasonOfflinePaid',
	OFFLINE_REDUCED: 'admin.reasonOfflineReduced',
	PAYMENT_CAPTURED: 'admin.reasonPaymentCaptured',
	PAYMENT_CAPTURED_RECORDED_ON_CANCEL: 'admin.reasonPaymentCaptured',
	PAYMENT_CAPTURED_RECORDED_BEFORE_REFUND: 'admin.reasonPaymentCaptured',
	PAYMENT_CAPTURED_THEN_REFUNDED: 'admin.reasonCapturedThenRefunded',
	PAYMENT_CAPTURED_AFTER_CANCEL: 'admin.reasonCapturedAfterCancel',
	PAID_FOR_ADDED_GUESTS: 'admin.reasonPaidForAddedGuests',
	ADDED_GUESTS_REFUNDED: 'admin.reasonAddedGuestsRefunded',
	BOOKING_CANCELLED_FEE_WITHHELD: 'admin.reasonCancelledFeeWithheld',
	EVENT_CANCELLED_FULL_REFUND: 'admin.reasonEventCancelled',
	OCCURRENCE_CANCELLED_FULL_REFUND: 'admin.reasonOccurrenceCancelled',
	NO_SPOTS_LEFT: 'admin.reasonNoSpotsLeft',
};

export function describeLedgerReason(
	reason: string | null | undefined,
	translate: Translate,
): string | null {
	if (!reason) return null;

	const match = matchLedgerReason(reason);
	if (!match) return reason;

	if (match.code === 'QUANTITY_CHANGED') {
		return translate('admin.reasonQuantityChanged', { from: match.from, to: match.to });
	}

	if (match.code === 'ADMIN_CANCELLED') {
		const text = translate('admin.reasonAdminCancelled');
		return match.note ? `${text}: ${match.note}` : text;
	}

	if (match.code === 'MANUAL_REFUND') {
		const text = translate('admin.reasonManualRefund');
		const nested = describeLedgerReason(match.note, translate);
		return nested ? `${text}: ${nested}` : text;
	}

	return translate(REASON_KEYS[match.code]);
}
