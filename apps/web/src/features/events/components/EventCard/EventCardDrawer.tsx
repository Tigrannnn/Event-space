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
	'pointer-events-auto relative z-20 flex h-10 w-full shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-gray-900 @min-[16rem]:size-11 transition-transform hover:scale-105 active:scale-95';

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
		<span className="flex h-9 items-center rounded-full bg-white/20 px-3 text-xs font-bold text-white/90">
			{translate('event.eventEndedButton')}
		</span>
	) : isUserLoading || (isMyBookingsLoading && user) ? (
		<Skeleton className="h-10 w-full rounded-full bg-white/40 @min-[16rem]:size-11" />
	) : hasBooking ? (
		<div className="flex w-full items-center gap-2 @min-[16rem]:w-auto">
			<Link
				href={localizePath('/bookings', locale)}
				onClick={(e) => e.stopPropagation()}
				aria-label={translate('event.viewMyBooking')}
				title={translate('event.viewMyBooking')}
				className={ACTION}
			>
				<Ticket className="size-5" />
			</Link>
			<button
				type="button"
				onClick={handleBookClick}
				aria-label={translate('event.bookAnotherSpot')}
				title={translate('event.bookAnotherSpot')}
				className="bg-primary pointer-events-auto relative z-20 flex h-10 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-transform hover:scale-105 @min-[16rem]:size-11"
			>
				<Plus className="size-5" strokeWidth={2.5} />
			</button>
		</div>
	) : (
		<button
			type="button"
			onClick={handleBookClick}
			aria-label={translate('event.bookTour')}
			title={translate('event.bookTour')}
			className={ACTION}
		>
			<ArrowUpRight className="size-5" strokeWidth={2.5} />
		</button>
	);

	return (
		<article className="group @container relative isolate aspect-3/4 overflow-hidden rounded-[1.75rem] bg-gray-200 dark:bg-neutral-800">
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

			<div className="pointer-events-none absolute inset-x-2 bottom-2 z-20 flex flex-col gap-3 rounded-3xl bg-black/45 p-3.5 text-white backdrop-blur-md">
				<div className="flex flex-col gap-1.5">
					{showSpots && (
						<p className="w-fit rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold">
							{translate('event.onlySpotsLeft', { count: spotsLeft })}
						</p>
					)}
					<h3 className="line-clamp-2 text-base leading-snug font-bold tracking-tight">
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
				</div>

				<div className="h-px bg-white/15" />

				<div
					className="flex flex-col gap-2.5 @min-[16rem]:flex-row @min-[16rem]:items-center @min-[16rem]:justify-between @min-[16rem]:gap-3"
					suppressHydrationWarning
				>
					<div className="min-w-0 flex-1">
						{isDiscounted && (
							<span className="block text-xs text-white/60 line-through">
								{formatCurrency(pricing.basePrice)}
							</span>
						)}
						<span className="block text-lg leading-tight font-black whitespace-nowrap">
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
