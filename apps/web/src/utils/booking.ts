import type { BookingDisplayStatus } from '@event-space/shared';

/**
 * Formats booking reference number to display format.
 * Converts number to 6-digit format with # prefix (e.g., #100142)
 * @param ref - The reference number to format
 * @returns Formatted reference string or "—" if null/undefined
 */
export function formatBookingReference(ref: number | null | undefined): string {
	if (!ref) return '—';
	return `#${String(ref).padStart(6, '0')}`;
}

const BOOKING_STATUS_BADGE_VARIANT = {
	PENDING: 'warning',
	CONFIRMED: 'success',
	CHECKED_IN: 'info',
	CANCELLED: 'danger',
} as const satisfies Record<BookingDisplayStatus, 'success' | 'warning' | 'danger' | 'info'>;

/** Badge colour for a booking's display status, shared by every list that shows one. */
export function getBookingStatusBadgeVariant(status: BookingDisplayStatus) {
	return BOOKING_STATUS_BADGE_VARIANT[status];
}
