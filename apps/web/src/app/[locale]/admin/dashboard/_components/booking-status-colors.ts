/**
 * One colour per booking status, shared by every widget on the dashboard that splits bookings up.
 *
 * Kept in one place because the same status shows up in three different shapes on this page — a
 * stacked area, a progress bar, a cohort strip — and a status that changes colour between them
 * reads as a different status.
 */
export const BOOKING_STATUS_COLORS = {
	confirmed: '#10b981',
	pending: '#f59e0b',
	cancelled: '#ef4444',
	expired: '#9ca3af',
} as const;

export type BookingStatusKey = keyof typeof BOOKING_STATUS_COLORS;
