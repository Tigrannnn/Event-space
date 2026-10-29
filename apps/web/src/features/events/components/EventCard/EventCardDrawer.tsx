'use client';

import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Plus, Star, Ticket } from 'lucide-react';
import { getEventCoverImageUrl } from '@event-space/shared';
import { Skeleton } from '@/components/ui/Skeleton';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { useFormatCurrency } from '@/hooks/format';
import { localizePath } from '@/lib/i18n/config';
import { EventImageWithFallback } from '../EventImage';
import { useEventCardState, type EventCardProps } from './useEventCardState';

/** Few enough left to say so; above this the number is noise. */
const SPOTS_NOTICE_LIMIT = 5;

const ACTION =
	'relative z-20 flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-white text-sm font-bold text-gray-900 transition-all hover:scale-105 active:scale-95';

/**
 * The drawer skin's tour card, a poster: the photo fills the whole card, and the date, the
 * title, the price and the booking action sit on it over a dark fade at the bottom.
 */
export default function EventCardDrawer({ event }: EventCardProps) {
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
		<span className="flex h-10 items-center rounded-full bg-white/25 px-4 text-sm font-bold text-white/90 backdrop-blur-sm">
			{translate('event.eventEndedButton')}
		</span>
	) : isUserLoading || (isMyBookingsLoading && user) ? (
		<Skeleton className="h-10 w-10 rounded-full bg-white/40 sm:w-28" />
	) : hasBooking ? (
		<div className="relative z-20 flex items-center gap-1.5">
			<Link
				href={localizePath('/bookings', locale)}
				onClick={(e) => e.stopPropagation()}
				aria-label={translate('event.viewMyBooking')}
				className={`${ACTION} size-10 sm:w-auto sm:px-4`}
			>
				<Ticket className="size-4" />
				<span className="hidden sm:inline">{translate('event.viewMyBooking')}</span>
			</Link>
			<button
				type="button"
				onClick={handleBookClick}
				aria-label={translate('event.bookAnotherSpot')}
				title={translate('event.bookAnotherSpot')}
				className="bg-primary flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-transform hover:scale-105"
			>
				<Plus className="size-4" strokeWidth={2.5} />
			</button>
		</div>
	) : (
		<button
			type="button"
			onClick={handleBookClick}
			aria-label={translate('event.bookTour')}
			className={`${ACTION} w-10 cursor-pointer sm:w-auto sm:px-4`}
		>
			<span className="hidden sm:inline">{translate('event.bookTour')}</span>
			<ArrowUpRight className="size-4" strokeWidth={2.5} />
		</button>
	);

	return (
		<article className="group relative isolate aspect-3/4 overflow-hidden rounded-[1.75rem] bg-gray-200 dark:bg-neutral-800">
			<Link
				href={localizePath(`/events/${event.id}`, locale)}
				aria-label={`View details for ${eventTranslation.title}`}
				className="focus-visible:ring-primary absolute inset-0 z-10 rounded-[1.75rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
			/>

			<div className="absolute inset-0 -z-10 transition-transform duration-700 group-hover:scale-105">
				<EventImageWithFallback src={getEventCoverImageUrl(event) ?? ''} alt={eventTranslation.title} />
			</div>
			<div className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/20 to-transparent" />

			<div className="absolute top-3 right-3 left-3 z-20 flex items-start justify-between gap-2">
				{isDiscounted ? (
					<span className="rounded-full bg-(--brand-accent) px-2.5 py-1 text-xs font-bold text-white">
						{translate('event.discountOff', { percent })}
					</span>
				) : (
					<span />
				)}
				<FavoriteButton eventId={event.id} />
			</div>

			<div className="absolute right-3 bottom-3 left-3 flex flex-col gap-2 text-white">
				{showSpots && (
					<p className="w-fit rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold">
						{translate('event.onlySpotsLeft', { count: spotsLeft })}
					</p>
				)}

				<h3 className="line-clamp-2 text-base leading-tight font-bold tracking-tight sm:text-lg">
					{eventTranslation.title}
				</h3>

				<div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/80">
					{occurrenceLabel && (
						<span className="flex min-w-0 items-center gap-1">
							<CalendarDays className="size-3.5 shrink-0" />
							<span className="truncate">{occurrenceLabel}</span>
						</span>
					)}
					{average !== null && (
						<span className="flex items-center gap-1 font-semibold text-white">
							<Star className="size-3.5 fill-amber-400 text-amber-400" />
							{average}
							{ratingCount > 0 && <span className="font-normal text-white/70">({ratingCount})</span>}
						</span>
					)}
				</div>

				<div className="flex items-end justify-between gap-2" suppressHydrationWarning>
					<div className="min-w-0">
						{isDiscounted && (
							<span className="block text-xs text-white/60 line-through">
								{formatCurrency(pricing.basePrice)}
							</span>
						)}
						<span className="block text-lg leading-none font-black sm:text-xl">
							{isDiscounted && (
								<span className="mr-1 text-xs font-medium text-white/70">
									{translate('event.priceFrom')}
								</span>
							)}
							{formatCurrency(pricing.fromPrice)}
						</span>
					</div>
					{control}
				</div>
			</div>
		</article>
	);
}
