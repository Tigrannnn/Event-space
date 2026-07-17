'use client';

import React from 'react';
import Button from '@/components/ui/Buttons/Button';
import { CategoryBadge } from '../CategoryBadge';
import { PriceBadge } from '../PriceBadge';
import { CapacityBar } from '../CapacityBar';

import { ModalType, useModalStore } from '@/stores';
import Link from 'next/link';
import { EventImageWithFallback } from '../EventImage';
import {
	Event,
	getEventCoverImageUrl,
	isEventAvailable,
	getEventTranslation,
	getCategoryTranslation,
	getUpcomingEventOccurrences,
	getPrimaryEventOccurrence,
} from '@event-space/shared';

export interface EventCardProps {
	event: Event;
}

import { useCurrentUser } from '@/features/users';
import { useGetMyBookings } from '@/features/bookings/hooks/useBookings';
import { BookOpen, MapPin, Ticket } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { localizePath } from '@/lib/i18n/config';
import { useTranslation } from '@/hooks/translation';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useFormatDate } from '@/hooks/format';

export default function EventCard({ event }: EventCardProps) {
	const { openModal } = useModalStore();
	const translate = useTranslation();
	const locale = translate.locale;
	const { formatDateTime } = useFormatDate();
	const navigation = useLocalizedNavigation();
	const { data: user, isLoading: isUserLoading } = useCurrentUser();
	const { data: myBookings, isLoading: isMyBookingsLoading } = useGetMyBookings();

	const eventIsAvailable = isEventAvailable(event);
	const eventTranslation = getEventTranslation(event, locale);
	const categoryTranslation = getCategoryTranslation(event.category, locale);
	const occurrenceDate = getPrimaryEventOccurrence(event);
	const upcomingOccurrences = getUpcomingEventOccurrences(event);
	const firstOccurrenceDate = upcomingOccurrences[0]?.date ?? occurrenceDate;
	const additionalOccurrencesCount = Math.max(upcomingOccurrences.length - 1, 0);
	const occurrenceLabel = firstOccurrenceDate
		? `${formatDateTime(firstOccurrenceDate ?? '')}${additionalOccurrencesCount > 0 ? ` ${translate('event.moreDates').replace('{count}', String(additionalOccurrencesCount))}` : ''}`
		: '';

	const hasBooking = React.useMemo(() => {
		if (!myBookings?.length) return false;

		const occurrenceIds = new Set((event.occurrences ?? []).map((occurrence) => occurrence.id));

		return myBookings.some((booking) => {
			const status = booking.status?.toUpperCase();
			if (status !== 'CONFIRMED') return false;

			const bookingOccurrenceId = booking.occurrenceId ?? booking.occurrence?.id;
			return Boolean(bookingOccurrenceId && occurrenceIds.has(bookingOccurrenceId));
		});
	}, [event.occurrences, myBookings]);

	const handleBookClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		if (user) {
			openModal(ModalType.CreateBooking, { event });
		} else {
			openModal(ModalType.Register);
		}
	};

	const handleViewBooking = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		navigation.push('/bookings');
	};

	return (
		<article className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl sm:rounded-4xl md:rounded-[2.5rem] dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
			<Link
				href={localizePath(`/events/${event.id}`, locale)}
				aria-label={`View details for ${eventTranslation.title}`}
				className="focus-visible:ring-primary absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:rounded-4xl md:rounded-[2.5rem]"
			/>
			{/* Media Section */}
			<div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100 sm:aspect-16/10 dark:bg-gray-900">
				{/* {categoryTranslation && <CategoryBadge>{categoryTranslation.name}</CategoryBadge>} */}
				<PriceBadge price={event.price} />
				<EventImageWithFallback src={getEventCoverImageUrl(event) ?? ''} alt={eventTranslation.title} />
			</div>

			{/* Content Section */}
			<div className="flex flex-1 flex-col p-4 sm:p-6 md:p-8">
				<div className="mb-3 flex items-center gap-2">
					<span className="bg-accent h-2 w-2 animate-pulse rounded-full" />
					<span
						className="text-accent text-[13px] font-bold tracking-wider uppercase sm:text-xs"
						suppressHydrationWarning
					>
						{occurrenceLabel}
					</span>
				</div>

				

				<h3 className="text-primary group-hover:text-accent mb-3 line-clamp-2 min-h-12 text-xl leading-tight font-black tracking-tight transition-colors sm:min-h-14 sm:text-2xl">
					{eventTranslation.title}
				</h3>

				<div className="mb-4 flex items-center gap-2 text-gray-600 sm:mb-6 dark:text-gray-400">
					<MapPin className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
					{event.locationUrl ? (
						<a
							href={event.locationUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-primary relative z-20 cursor-pointer text-left text-sm font-medium underline underline-offset-2 transition-colors sm:text-base"
						>
							{eventTranslation.location}
						</a>
					) : (
						<span className="text-sm font-medium sm:text-base">{eventTranslation.location}</span>
					)}
				</div>

				{/* Footer Section: Metrics & Action - always at bottom */}
				<div className="mt-auto space-y-4 border-t border-gray-50 pt-4 sm:space-y-6 sm:pt-6 dark:border-gray-700/50">
					{!eventIsAvailable ? (
						<Button disabled variant="secondary" className="relative z-20 w-full">
							{translate('event.eventEndedButton')}
						</Button>
					) : isUserLoading || isMyBookingsLoading ? (
						<Skeleton className="h-12 w-full rounded-xl" />
					) : hasBooking ? (
						<Button variant="secondary" className="relative z-20 w-full" onClick={handleViewBooking}>
							<Ticket className="h-4 w-4" />
							{translate('event.viewMyBooking')}
						</Button>
					) : (
						<Button variant="primary" className="relative z-20 w-full" onClick={handleBookClick}>
							<BookOpen className="h-4 w-4" />
							{translate('event.bookTour')}
						</Button>
					)}
				</div>
			</div>
		</article>
	);
}
