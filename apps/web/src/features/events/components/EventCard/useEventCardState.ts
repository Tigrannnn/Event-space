'use client';

import React from 'react';
import {
	averageRating,
	eventPricing,
	getEventTranslation,
	getPrimaryEventOccurrence,
	getUpcomingEventOccurrences,
	isEventAvailable,
	type Event,
} from '@event-space/shared';
import { ModalType, useModalStore } from '@/stores';
import { useCurrentUser } from '@/features/users';
import { useHasBookingForOccurrence } from '@/features/bookings/hooks/useBookings';
import { useTranslation } from '@/hooks/translation';
import { useFormatDate } from '@/hooks/format';

export interface EventCardProps {
	event: Event;
}

/** Everything a tour card shows or does, so each skin only decides how it looks. */
export function useEventCardState(event: Event) {
	const { openModal } = useModalStore();
	const translate = useTranslation();
	const locale = translate.locale;
	const { formatDateTime } = useFormatDate();
	const { data: user, isLoading: isUserLoading } = useCurrentUser();
	const { hasBooking: isOccurrenceBooked, isLoading: isMyBookingsLoading } =
		useHasBookingForOccurrence();

	const eventIsAvailable = isEventAvailable(event);
	const pricing = eventPricing(event);
	const average = averageRating(event);
	const eventTranslation = getEventTranslation(event, locale);
	const occurrenceDate = getPrimaryEventOccurrence(event);
	const upcomingOccurrences = getUpcomingEventOccurrences(event);
	const firstOccurrenceDate = upcomingOccurrences[0]?.date ?? occurrenceDate;
	const additionalOccurrencesCount = Math.max(upcomingOccurrences.length - 1, 0);
	const occurrenceLabel = firstOccurrenceDate
		? `${formatDateTime(firstOccurrenceDate ?? '')}${additionalOccurrencesCount > 0 ? ` ${translate('event.moreDates').replace('{count}', String(additionalOccurrencesCount))}` : ''}`
		: '';

	const nextOccurrence = upcomingOccurrences[0];
	const spotsLeft = nextOccurrence
		? Math.max(
				0,
				Number(nextOccurrence.maxParticipants ?? 0) - Number(nextOccurrence.currentParticipants ?? 0),
			)
		: null;
	const hasFreeCancellation = (event.cancellationRules ?? []).some(
		(rule) => rule.refundPercentage === 100 && rule.hoursBeforeEvent > 0,
	);
	const ratingCount = event.ratingCount ?? 0;

	const hasBooking = (event.occurrences ?? []).some((occurrence) =>
		isOccurrenceBooked(occurrence.id),
	);

	const handleBookClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		if (user) {
			openModal(ModalType.CreateBooking, { event });
		} else {
			openModal(ModalType.Register);
		}
	};

	return {
		translate,
		locale,
		user,
		isUserLoading,
		isMyBookingsLoading,
		eventIsAvailable,
		pricing,
		average,
		eventTranslation,
		occurrenceLabel,
		hasBooking,
		spotsLeft,
		hasFreeCancellation,
		ratingCount,
		handleBookClick,
	};
}
