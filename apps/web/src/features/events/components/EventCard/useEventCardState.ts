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
import { bookingPath } from '@/utils/booking';
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
	const {
		hasBooking: isOccurrenceBooked,
		bookingIdFor,
		isLoading: isMyBookingsLoading,
	} = useHasBookingForOccurrence();

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
	const ratingCount = event.ratingCount ?? 0;

	const hasBooking = (event.occurrences ?? []).some((occurrence) =>
		isOccurrenceBooked(occurrence.id),
	);

	// The soonest date the visitor holds a booking for: that is the one worth jumping to.
	const bookedOccurrence = [...(event.occurrences ?? [])]
		.filter((occurrence) => isOccurrenceBooked(occurrence.id))
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		.find((occurrence) => new Date(occurrence.date).getTime() > Date.now());
	const fallbackOccurrence = (event.occurrences ?? []).find((occurrence) =>
		isOccurrenceBooked(occurrence.id),
	);
	const myBookingPath = bookingPath(bookingIdFor((bookedOccurrence ?? fallbackOccurrence)?.id));

	const handleBookClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		openModal(ModalType.CreateBooking, { event });
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
		myBookingPath,
		spotsLeft,
		ratingCount,
		handleBookClick,
	};
}
