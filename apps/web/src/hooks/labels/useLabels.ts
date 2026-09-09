'use client';

import type {
	EventStatus,
	EventDifficulty,
	EventOccurrenceDisplayState,
	TimeFilterType,
	BookingStatus,
	UserRoleType,
	PaymentMethod,
} from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

export function useLabels() {
	const translate = useTranslation();

	const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
		DRAFT: translate('admin.draft'),
		PUBLISHED: translate('admin.published'),
		CANCELLED: translate('admin.cancelled'),
	};

	const EVENT_DIFFICULTY_LABELS: Record<EventDifficulty, string> = {
		EASY: translate('admin.easy'),
		MODERATE: translate('admin.moderate'),
		HARD: translate('admin.hard'),
	};

	// "Finished" is derived from the date, not stored, so it lives alongside the two
	// real database states rather than in EVENT_STATUS_LABELS.
	const EVENT_OCCURRENCE_STATE_LABELS: Record<EventOccurrenceDisplayState, string> = {
		ACTIVE: translate('admin.active'),
		FINISHED: translate('admin.finished'),
		CANCELLED: translate('admin.cancelled'),
	};

	const TIME_FILTER_LABELS: Record<TimeFilterType, string> = {
		upcoming: translate('admin.upcoming'),
		completed: translate('admin.completed'),
	};

	const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
		PENDING: translate('admin.pending'),
		CONFIRMED: translate('admin.confirmed'),
		CANCELLED: translate('admin.cancelled'),
		EXPIRED: translate('booking.bookingExpired'),
	};

	const USER_ROLE_LABELS: Record<UserRoleType, string> = {
		USER: translate('admin.user'),
		ADMIN: translate('admin.admin'),
	};

	const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
		SITE_PAYMENT: translate('admin.payment.site'),
		OFFLINE_PAID: translate('admin.payment.offline'),
		PAY_ON_ARRIVAL: translate('admin.payment.onArrival'),
	};

	return {
		EVENT_STATUS_LABELS,
		EVENT_DIFFICULTY_LABELS,
		EVENT_OCCURRENCE_STATE_LABELS,
		TIME_FILTER_LABELS,
		BOOKING_STATUS_LABELS,
		USER_ROLE_LABELS,
		PAYMENT_METHOD_LABELS,
	};
}
