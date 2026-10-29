'use client';

import Link from 'next/link';
import { Calendar, MapPin, Plus, Ticket } from 'lucide-react';
import { getEventCoverImageUrl } from '@event-space/shared';
import { Skeleton } from '@/components/ui/Skeleton';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { useFormatCurrency } from '@/hooks/format';
import { localizePath } from '@/lib/i18n/config';
import { EventImageWithFallback } from '../EventImage';
import { useEventCardState, type EventCardProps } from './useEventCardState';

/** Shown as a warning once a date is down to this many places. */

/**
 * The listing skin's tour card: a row with the photo on the left, the facts in the middle and
 * the price with the booking button on the right, the way a search result reads on a travel
 * marketplace. Badges state only what the data says.
 */
export default function EventCardListing({ event }: EventCardProps) {
	const {
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
		ratingCount,
		handleBookClick,
	} = useEventCardState(event);
	const formatCurrency = useFormatCurrency();

	const percent = pricing.maxDiscountPercent ?? 0;
	const isDiscounted = percent > 0 && pricing.basePrice !== null && pricing.basePrice !== undefined;

	const control = !eventIsAvailable ? (
		<span className="text-sm font-medium text-gray-400">{translate('event.eventEndedButton')}</span>
	) : isUserLoading || (isMyBookingsLoading && user) ? (
		<Skeleton className="h-10 w-full rounded-md sm:w-40" />
	) : hasBooking ? (
		<div className="relative z-20 flex w-full items-center gap-2">
			<Link
				href={localizePath('/bookings', locale)}
				onClick={(e) => e.stopPropagation()}
				className="text-primary border-primary hover:bg-primary/5 flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors"
			>
				<Ticket className="size-4" />
				<span>{translate('event.viewMyBooking')}</span>
			</Link>
			<button
				type="button"
				onClick={handleBookClick}
				aria-label={translate('event.bookAnotherSpot')}
				title={translate('event.bookAnotherSpot')}
				className="bg-primary flex size-10 shrink-0 items-center justify-center rounded-md text-white transition-colors hover:brightness-90"
			>
				<Plus className="size-4" strokeWidth={2.5} />
			</button>
		</div>
	) : (
		<button
			type="button"
			onClick={handleBookClick}
			className="bg-primary relative z-20 w-full rounded-md px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-90"
		>
			{translate('event.chooseDates')}
		</button>
	);

	return (
		<article className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md sm:flex-row dark:border-neutral-800 dark:bg-neutral-900">
			<Link
				href={localizePath(`/events/${event.id}`, locale)}
				aria-label={`View details for ${eventTranslation.title}`}
				className="focus-visible:ring-primary absolute inset-0 z-10 rounded-lg focus:outline-none focus-visible:ring-2"
			/>

			<div className="relative aspect-video w-full shrink-0 overflow-hidden bg-gray-100 sm:aspect-auto sm:min-h-52 sm:w-64 lg:w-80 dark:bg-neutral-800">
				<div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]">
					<EventImageWithFallback
						src={getEventCoverImageUrl(event) ?? ''}
						alt={eventTranslation.title}
					/>
				</div>
				<div className="absolute top-2.5 right-2.5 z-20">
					<FavoriteButton eventId={event.id} />
				</div>
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
				<div className="flex items-start justify-between gap-3">
					<h3 className="text-primary line-clamp-2 text-lg leading-snug font-bold sm:text-xl">
						{eventTranslation.title}
					</h3>
					{average !== null && (
						<div className="flex shrink-0 items-center gap-2">
							{ratingCount > 0 && (
								<span className="hidden text-xs text-gray-500 lg:block dark:text-gray-400">
									{translate('event.reviewsCount', { count: ratingCount })}
								</span>
							)}
							<span className="bg-primary rounded-md rounded-bl-none px-2 py-1 text-sm font-bold text-white">
								{average}
							</span>
						</div>
					)}
				</div>

				<p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
					<MapPin className="text-primary size-4 shrink-0" />
					<span className="truncate">{eventTranslation.location}</span>
				</p>
				<p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
					<Calendar className="text-primary size-4 shrink-0" />
					<span className="truncate">{occurrenceLabel}</span>
				</p>

			</div>

			<div className="flex shrink-0 flex-col justify-end gap-3 border-t border-gray-200 p-4 sm:w-52 sm:border-t-0 sm:border-l lg:w-60 dark:border-neutral-800">
				<div className="flex items-end justify-between gap-2 sm:flex-col sm:items-end sm:justify-end sm:gap-1">
					{isDiscounted && (
						<span className="rounded bg-(--brand-accent) px-2 py-0.5 text-xs font-bold text-white">
							{translate('event.discountOff', { percent })}
						</span>
					)}
					<div className="text-left sm:text-right" suppressHydrationWarning>
						{isDiscounted && (
							<div className="text-sm text-gray-400 line-through">
								{formatCurrency(pricing.basePrice as number | string)}
							</div>
						)}
						<div className="text-xl font-bold text-gray-900 dark:text-white">
							{isDiscounted ? `${translate('event.priceFrom')} ` : ''}
							{formatCurrency(pricing.fromPrice)}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">{translate('event.perPerson')}</div>
					</div>
				</div>
				<div className="shrink-0">{control}</div>
			</div>
		</article>
	);
}
