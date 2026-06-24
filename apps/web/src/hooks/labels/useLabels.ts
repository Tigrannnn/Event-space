'use client';

import type {
	EventStatus,
	EventDifficulty,
	TimeFilterType,
	BookingStatus,
	UserRoleType,
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

	const TIME_FILTER_LABELS: Record<TimeFilterType, string> = {
		upcoming: translate('admin.upcoming'),
		completed: translate('admin.completed'),
	};

	const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
		PENDING: translate('admin.pending'),
		CONFIRMED: translate('admin.confirmed'),
		CANCELLED: translate('admin.cancelled'),
	};

	const USER_ROLE_LABELS: Record<UserRoleType, string> = {
		USER: translate('admin.user'),
		ADMIN: translate('admin.admin'),
	};

	return {
		EVENT_STATUS_LABELS,
		EVENT_DIFFICULTY_LABELS,
		TIME_FILTER_LABELS,
		BOOKING_STATUS_LABELS,
		USER_ROLE_LABELS,
	};
}
