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

/**
 * The date this booking was made for, when the tour was moved afterwards.
 *
 * Someone who booked after the move chose the current date themselves and must not be told
 * anything changed, so the move only counts when it happened after the booking was made.
 */
export function movedFromDate(booking: {
	createdAt: string | Date;
	occurrence?: { previousDate?: string | Date | null; rescheduledAt?: string | Date | null } | null;
}): Date | null {
	const { previousDate, rescheduledAt } = booking.occurrence ?? {};
	if (!previousDate || !rescheduledAt) return null;

	const moved = new Date(rescheduledAt);
	return new Date(booking.createdAt) < moved ? new Date(previousDate) : null;
}
