'use client';

import Link from 'next/link';
import { CalendarDays, Plus, Star, Ticket } from 'lucide-react';
import { getEventCoverImageUrl } from '@event-space/shared';
import { Skeleton } from '@/components/ui/Skeleton';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { useFormatCurrency } from '@/hooks/format';
import { localizePath } from '@/lib/i18n/config';
import { EventImageWithFallback } from '../EventImage';
import { useEventCardState, type EventCardProps } from './useEventCardState';

/** Few enough left to say so; above this the number is noise. */
const SPOTS_NOTICE_LIMIT = 5;

/**
 * The market skin's tour card, after the big marketplaces: a borderless tile with the photo on
 * top, the price as the loudest thing under it (the sale price in the second brand colour with
 * the old one struck through), the title, the date, and a full-width button at the bottom.
 */
export default function EventCardMarket({ event }: EventCardProps) {
	const {
		translate,
		locale,
		user,
		isUserLoading,
		isMyBookingsLoading,
		eventIsAvailable,
		pricing,
		average,
		ratingCount,
		spotsLeft,
		eventTranslation,
		occurrenceLabel,
		hasBooking,
		handleBookClick,
	} = useEventCardState(event);
	const formatCurrency = useFormatCurrency();

	const percent = pricing.maxDiscountPercent ?? 0;
	const isDiscounted = percent > 0;
	const showSpots = spotsLeft !== null && spotsLeft > 0 && spotsLeft <= SPOTS_NOTICE_LIMIT;

	const control = !eventIsAvailable ? (
		<span className="block rounded-xl bg-gray-100 py-2.5 text-center text-sm font-semibold text-gray-400 dark:bg-neutral-800">
			{translate('event.eventEndedButton')}
		</span>
	) : isUserLoading || (isMyBookingsLoading && user) ? (
		<Skeleton className="h-10 w-full rounded-xl" />
	) : hasBooking ? (
		<div className="relative z-20 flex items-center gap-2">
			<Link
				href={localizePath('/bookings', locale)}
				onClick={(e) => e.stopPropagation()}
				className="text-primary bg-primary/10 hover:bg-primary/15 flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors"
			>
				<Ticket className="size-4" />
				{translate('event.viewMyBooking')}
			</Link>
			<button
				type="button"
				onClick={handleBookClick}
				aria-label={translate('event.bookAnotherSpot')}
				title={translate('event.bookAnotherSpot')}
				className="bg-primary flex size-10 shrink-0 items-center justify-center rounded-xl text-white transition-colors hover:brightness-90"
			>
				<Plus className="size-4" strokeWidth={2.5} />
			</button>
		</div>
	) : (
		<button
			type="button"
			onClick={handleBookClick}
			className="bg-primary relative z-20 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:brightness-90 active:scale-[0.98]"
		>
			{translate('event.bookTour')}
		</button>
	);

	return (
		<article className="group relative flex flex-col">
			<Link
				href={localizePath(`/events/${event.id}`, locale)}
				aria-label={`View details for ${eventTranslation.title}`}
				className="focus-visible:ring-primary absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
			/>

			<div className="relative aspect-5/4 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-800">
				<div className="size-full transition-transform duration-500 group-hover:scale-105">
					<EventImageWithFallback
						src={getEventCoverImageUrl(event) ?? ''}
						alt={eventTranslation.title}
					/>
				</div>
				{isDiscounted && (
					<span className="absolute bottom-2 left-2 z-20 rounded-md bg-(--brand-accent) px-2 py-0.5 text-xs font-bold text-white">
						{translate('event.discountOff', { percent })}
					</span>
				)}
				<div className="absolute top-2 right-2 z-20">
					<FavoriteButton eventId={event.id} />
				</div>
			</div>

			<div className="flex flex-1 flex-col pt-3">
				<div className="flex flex-wrap items-baseline gap-x-2" suppressHydrationWarning>
					<span
						className={
							isDiscounted
								? 'text-xl font-bold text-(--brand-accent)'
								: 'text-xl font-bold text-gray-900 dark:text-white'
						}
					>
						{isDiscounted ? `${translate('event.priceFrom')} ` : ''}
						{formatCurrency(pricing.fromPrice)}
					</span>
					{isDiscounted && (
						<span className="text-sm text-gray-400 line-through">
							{formatCurrency(pricing.basePrice)}
						</span>
					)}
				</div>

				<h3 className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 font-medium text-gray-900 dark:text-gray-100">
					{eventTranslation.title}
				</h3>

				<div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
					{occurrenceLabel && (
						<span className="flex min-w-0 items-center gap-1">
							<CalendarDays className="size-3.5 shrink-0" />
							<span className="truncate">{occurrenceLabel}</span>
						</span>
					)}
					{average !== null && (
						<span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-200">
							<Star className="size-3.5 fill-amber-400 text-amber-400" />
							{average}
							{ratingCount > 0 && <span className="font-normal text-gray-400">({ratingCount})</span>}
						</span>
					)}
				</div>

				{showSpots && (
					<p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
						{translate('event.onlySpotsLeft', { count: spotsLeft })}
					</p>
				)}

				<div className="mt-auto pt-3">{control}</div>
			</div>
		</article>
	);
}
