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

export default function EventCardCapsule({ event }: EventCardProps) {
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
		eventTranslation,
		occurrenceLabel,
		hasBooking,
		myBookingPath,
		handleBookClick,
	} = useEventCardState(event);
	const formatCurrency = useFormatCurrency();

	const percent = pricing.maxDiscountPercent ?? 0;
	const isDiscounted = percent > 0;

	const control = !eventIsAvailable ? (
		<span className="block rounded-full bg-gray-100 py-3 text-center text-sm font-bold text-gray-400">
			{translate('event.eventEndedButton')}
		</span>
	) : isUserLoading || (isMyBookingsLoading && user) ? (
		<Skeleton className="h-11 w-full rounded-full" />
	) : hasBooking ? (
		<div className="relative z-20 flex items-center gap-2">
			<Link
				href={localizePath(myBookingPath, locale)}
				onClick={(e) => e.stopPropagation()}
				className="text-primary bg-primary/10 hover:bg-primary/15 flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-sm font-bold transition-colors"
			>
				<Ticket className="size-4" />
				{translate('event.viewMyBooking')}
			</Link>
			<button
				type="button"
				onClick={handleBookClick}
				aria-label={translate('event.bookAnotherSpot')}
				title={translate('event.bookAnotherSpot')}
				className="bg-primary flex size-11 shrink-0 items-center justify-center rounded-full text-white transition-all hover:brightness-125"
			>
				<Plus className="size-4" strokeWidth={2.5} />
			</button>
		</div>
	) : (
		<button
			type="button"
			onClick={handleBookClick}
			className="bg-primary relative z-20 flex w-full items-center justify-center gap-1.5 rounded-full py-3 text-sm font-bold text-white transition-all hover:brightness-125 active:scale-[0.98]"
		>
			{translate('event.bookTour')}
			<ArrowUpRight className="size-4" strokeWidth={2.5} />
		</button>
	);

	return (
		<article className="group relative flex flex-col">
			<Link
				href={localizePath(`/events/${event.id}`, locale)}
				aria-label={translate('event.viewDetailsFor', { title: eventTranslation.title })}
				data-no-tooltip
				className="focus-visible:ring-primary absolute inset-0 z-10 rounded-t-[999px] rounded-b-[2rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
			/>

			<div className="relative aspect-4/5 w-full overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-gray-100">
				<div className="size-full transition-transform duration-700 group-hover:scale-105">
					<EventImageWithFallback
						src={getEventCoverImageUrl(event) ?? ''}
						alt={eventTranslation.title}
					/>
				</div>
				{isDiscounted && (
					<span className="absolute top-[18%] left-1/2 z-20 -translate-x-1/2 rounded-full bg-red-500 px-3 py-1 text-xs font-extrabold text-white">
						{translate('event.discountOff', { percent })}
					</span>
				)}
				{occurrenceLabel && (
					<span className="text-primary absolute bottom-3 left-3 z-20 flex max-w-[calc(100%-4.5rem)] items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold backdrop-blur">
						<CalendarDays className="size-3.5 shrink-0" />
						<span className="truncate">{occurrenceLabel}</span>
					</span>
				)}
				<div className="absolute right-3 bottom-3 z-20">
					<FavoriteButton eventId={event.id} />
				</div>
			</div>

			<div className="flex flex-1 flex-col px-1 pt-4">
				<h3 className="text-primary line-clamp-2 min-h-12 text-base leading-6 font-bold break-words">
					{eventTranslation.title}
				</h3>

				<div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1" suppressHydrationWarning>
					<span
						className={
							isDiscounted
								? 'text-xl font-extrabold text-(--brand-accent)'
								: 'text-primary text-xl font-extrabold'
						}
					>
						{isDiscounted && <span className="text-red-500">{translate('event.priceFrom')} </span>}
						{formatCurrency(pricing.fromPrice)}
					</span>
					{isDiscounted && (
						<span className="text-sm text-gray-400 line-through">
							{formatCurrency(pricing.basePrice)}
						</span>
					)}
					{average !== null && (
						<span className="ml-auto flex items-center gap-1 text-sm font-bold text-gray-700">
							<Star className="size-3.5 fill-amber-400 text-amber-400" />
							{average}
							{ratingCount > 0 && <span className="font-medium text-gray-400">({ratingCount})</span>}
						</span>
					)}
				</div>

				<div className="mt-auto pt-4">{control}</div>
			</div>
		</article>
	);
}
