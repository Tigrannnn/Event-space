import type { EventStatus, EventDifficulty, TimeFilterType, BookingStatus } from '@event-space/shared';

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
	DRAFT: 'Draft (Not public)',
	PUBLISHED: 'Published',
	CANCELLED: 'Cancelled',
};

export const EVENT_DIFFICULTY_LABELS: Record<EventDifficulty, string> = {
	EASY: 'Easy',
	MODERATE: 'Moderate',
	HARD: 'Hard',
};

export const TIME_FILTER_LABELS: Record<TimeFilterType, string> = {
	upcoming: 'Upcoming',
	completed: 'Completed',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
	PENDING: 'Pending',
	CONFIRMED: 'Confirmed',
	CANCELLED: 'Cancelled',
};
