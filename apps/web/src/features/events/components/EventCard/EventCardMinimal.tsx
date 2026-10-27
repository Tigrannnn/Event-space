'use client';

import Link from 'next/link';
import { Plus, Star, Ticket } from 'lucide-react';
import { getEventCoverImageUrl } from '@event-space/shared';
import { Skeleton } from '@/components/ui/Skeleton';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { useFormatCurrency } from '@/hooks/format';
import { localizePath } from '@/lib/i18n/config';
import { EventImageWithFallback } from '../EventImage';
import { useEventCardState, type EventCardProps } from './useEventCardState';

/**
 * The minimal skin's tour card: the photo carries the card, the text sits under it with no box
 * around it, and the booking control is one small button on the price line.
 */
export default function EventCardMinimal({ event }: EventCardProps) {
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
	const isDiscounted = percent > 0 && pricing.basePrice !== null && pricing.basePrice !== undefined;

	const control = !eventIsAvailable ? (
		<span className="text-sm font-medium text-gray-400">{translate('event.eventEndedButton')}</span>
	) : isUserLoading || (isMyBookingsLoading && user) ? (
		<Skeleton className="h-9 w-24 rounded-full" />
	) : hasBooking ? (
		<div className="relative z-20 flex items-center gap-1.5">
			<Link
				href={localizePath('/bookings', locale)}
				onClick={(e) => e.stopPropagation()}
				className="text-primary border-primary/40 hover:bg-primary/5 flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors"
			>
				<Ticket className="size-4" />
				<span>{translate('event.viewMyBooking')}</span>
			</Link>
			<button
				type="button"
				onClick={handleBookClick}
				aria-label={translate('event.bookAnotherSpot')}
				title={translate('event.bookAnotherSpot')}
				className="bg-primary hover:bg-primary/90 flex size-9 items-center justify-center rounded-full text-white transition-colors"
			>
				<Plus className="size-4" strokeWidth={2.5} />
			</button>
		</div>
	) : (
		<button
			type="button"
			onClick={handleBookClick}
			className="bg-primary hover:bg-primary/90 relative z-20 rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors"
		>
			{translate('event.bookTour')}
		</button>
	);

	return (
		<article className="group relative flex flex-col">
			<Link
				href={localizePath(`/events/${event.id}`, locale)}
				aria-label={`View details for ${eventTranslation.title}`}
				className="focus-visible:ring-primary absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
			/>

			<div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-neutral-900">
				<div className="size-full transition-transform duration-500 group-hover:scale-[1.03]">
					<EventImageWithFallback
						src={getEventCoverImageUrl(event) ?? ''}
						alt={eventTranslation.title}
					/>
				</div>
				{isDiscounted && (
					<span className="absolute top-3 left-3 z-20 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm">
						{translate('event.discountOff', { percent })}
					</span>
				)}
				<div className="absolute top-3 right-3 z-20">
					<FavoriteButton eventId={event.id} />
				</div>
			</div>

			<div className="flex flex-1 flex-col gap-0.5 pt-3">
				<div className="flex items-start justify-between gap-3">
					<h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-gray-900 dark:text-white">
						{eventTranslation.title}
					</h3>
					{average !== null && (
						<span className="flex shrink-0 items-center gap-1 text-sm text-gray-900 dark:text-gray-100">
							<Star className="size-3.5 fill-current" />
							{average}
						</span>
					)}
				</div>

				<p className="text-sm text-gray-500 dark:text-gray-400">{occurrenceLabel}</p>
				<p className="truncate text-sm text-gray-500 dark:text-gray-400">{eventTranslation.location}</p>

				<div className="mt-2 flex items-end justify-between gap-3">
					<div className="min-w-0 text-[15px] text-gray-900 dark:text-white" suppressHydrationWarning>
						{isDiscounted && (
							<div className="text-sm text-gray-400 line-through">
								{formatCurrency(pricing.basePrice as number | string)}
							</div>
						)}
						<div className="truncate font-semibold">
							{isDiscounted ? `${translate('event.priceFrom')} ` : ''}
							{formatCurrency(pricing.fromPrice)}
						</div>
					</div>
					<div className="shrink-0 whitespace-nowrap">{control}</div>
				</div>
			</div>
		</article>
	);
}
