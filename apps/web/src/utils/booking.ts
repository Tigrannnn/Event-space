import type { BookingDisplayStatus } from '@event-space/shared';

/**
 * Formats booking reference number to display format.
 * Converts number to 6-digit format with # prefix (e.g., #100142)
 * @param ref - The reference number to format
 * @returns Formatted reference string or "—" if null/undefined
 */
/** The bookings page opened on one booking: it scrolls there and lights the card up. */
export function bookingPath(bookingId?: string | null): string {
	return bookingId ? `/bookings?booking=${encodeURIComponent(bookingId)}` : '/bookings';
}

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

export function movedFromDate(booking: {
	createdAt: string | Date;
	occurrence?: { previousDate?: string | Date | null; rescheduledAt?: string | Date | null } | null;
}): Date | null {
	const { previousDate, rescheduledAt } = booking.occurrence ?? {};
	if (!previousDate || !rescheduledAt) return null;

	const moved = new Date(rescheduledAt);
	return new Date(booking.createdAt) < moved ? new Date(previousDate) : null;
}
