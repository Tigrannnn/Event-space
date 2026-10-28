'use client';

import Link from 'next/link';
import { CalendarDays, MapPin, Plus, Star, Ticket } from 'lucide-react';
import { getEventCoverImageUrl } from '@event-space/shared';
import { Skeleton } from '@/components/ui/Skeleton';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { useFormatCurrency } from '@/hooks/format';
import { localizePath } from '@/lib/i18n/config';
import { EventImageWithFallback } from '../EventImage';
import { useEventCardState, type EventCardProps } from './useEventCardState';

/**
 * The soft skin's tour card: a white tile with the photo set inside it rather than bleeding to
 * the edge, the date on a chip over the photo, and the price in the serif beside a round
 * booking button. Same friendly shapes as the classic card, laid out differently.
 */
export default function EventCardSoft({ event }: EventCardProps) {
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
		handleBookClick,
	} = useEventCardState(event);
	const formatCurrency = useFormatCurrency();

	const percent = pricing.maxDiscountPercent ?? 0;
	const isDiscounted = percent > 0;

	const control = !eventIsAvailable ? (
		<span className="text-sm font-semibold text-gray-400">{translate('event.eventEndedButton')}</span>
	) : isUserLoading || (isMyBookingsLoading && user) ? (
		<Skeleton className="h-11 w-28 rounded-full" />
	) : hasBooking ? (
		<div className="relative z-20 flex items-center gap-1.5">
			<Link
				href={localizePath('/bookings', locale)}
				onClick={(e) => e.stopPropagation()}
				className="text-primary bg-primary/10 hover:bg-primary/15 flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition-colors"
			>
				<Ticket className="size-4" />
				{translate('event.viewMyBooking')}
			</Link>
			<button
				type="button"
				onClick={handleBookClick}
				aria-label={translate('event.bookAnotherSpot')}
				title={translate('event.bookAnotherSpot')}
				className="bg-primary flex size-10 items-center justify-center rounded-full text-white transition-transform hover:scale-105"
			>
				<Plus className="size-4" strokeWidth={2.5} />
			</button>
		</div>
	) : (
		<button
			type="button"
			onClick={handleBookClick}
			className="bg-primary relative z-20 rounded-full px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
		>
			{translate('event.bookTour')}
		</button>
	);

	return (
		<article className="group relative flex flex-col rounded-3xl border border-gray-200/70 bg-white p-3 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
			<Link
				href={localizePath(`/events/${event.id}`, locale)}
				aria-label={`View details for ${eventTranslation.title}`}
				className="focus-visible:ring-primary absolute inset-0 z-10 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
			/>

			<div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900">
				<div className="size-full transition-transform duration-500 group-hover:scale-105">
					<EventImageWithFallback
						src={getEventCoverImageUrl(event) ?? ''}
						alt={eventTranslation.title}
					/>
				</div>
				<span className="absolute bottom-3 left-3 z-20 flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-800 shadow-sm">
					<CalendarDays className="text-accent size-3.5 shrink-0" />
					<span className="truncate">{occurrenceLabel}</span>
				</span>
				{isDiscounted && (
					<span className="absolute top-3 left-3 z-20 rounded-full bg-(--brand-accent) px-2.5 py-1 text-xs font-bold text-white shadow-sm">
						{translate('event.discountOff', { percent })}
					</span>
				)}
				<div className="absolute top-2.5 right-2.5 z-20">
					<FavoriteButton eventId={event.id} />
				</div>
			</div>

			<div className="flex flex-1 flex-col px-2 pt-4 pb-1">
				<div className="flex items-start justify-between gap-3">
					<h3 className="text-primary line-clamp-2 min-h-[3.25rem] text-xl leading-snug font-bold">
						{eventTranslation.title}
					</h3>
					{average !== null && (
						<span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
							<Star className="size-3.5 fill-current" />
							{average}
						</span>
					)}
				</div>

				<p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
					<MapPin className="text-primary size-4 shrink-0" />
					<span className="truncate">{eventTranslation.location}</span>
				</p>

				<div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-gray-300 pt-4 dark:border-gray-600">
					<div className="min-w-0" suppressHydrationWarning>
						{isDiscounted && (
							<div className="text-xs text-gray-400 line-through">
								{formatCurrency(pricing.basePrice)}
							</div>
						)}
						<div className="font-(family-name:--font-display) text-xl font-bold text-gray-900 dark:text-white">
							{isDiscounted ? `${translate('event.priceFrom')} ` : ''}
							{formatCurrency(pricing.fromPrice)}
						</div>
					</div>
					<div className="shrink-0">{control}</div>
				</div>
			</div>
		</article>
	);
}
