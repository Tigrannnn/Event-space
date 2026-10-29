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
	'pointer-events-auto relative z-20 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95';

/**
 * The drawer skin's tour card. A wide card is a poster: the photo fills it and the details sit
 * in a frosted panel over its lower part. A narrow one (a phone's two columns) keeps the photo
 * clear and puts the same details beneath it, since a panel there would cover the whole picture.
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

	const control = (onPhoto: boolean) => {
		const solid = onPhoto
			? 'bg-white text-gray-900'
			: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900';

		if (!eventIsAvailable) {
			return (
				<span
					className={`flex h-9 items-center rounded-full px-3 text-xs font-bold ${
						onPhoto
							? 'bg-white/20 text-white/90'
							: 'bg-gray-200 text-gray-600 dark:bg-neutral-800 dark:text-gray-300'
					}`}
				>
					{translate('event.eventEndedButton')}
				</span>
			);
		}

		if (isUserLoading || (isMyBookingsLoading && user)) {
			return <Skeleton className="size-11 rounded-full" />;
		}

		if (hasBooking) {
			return (
				<div className="flex items-center gap-2">
					<Link
						href={localizePath('/bookings', locale)}
						onClick={(e) => e.stopPropagation()}
						aria-label={translate('event.viewMyBooking')}
						title={translate('event.viewMyBooking')}
						className={`${ACTION} ${solid}`}
					>
						<Ticket className="size-5" />
					</Link>
					<button
						type="button"
						onClick={handleBookClick}
						aria-label={translate('event.bookAnotherSpot')}
						title={translate('event.bookAnotherSpot')}
						className={`${ACTION} bg-primary text-white`}
					>
						<Plus className="size-5" strokeWidth={2.5} />
					</button>
				</div>
			);
		}

		return (
			<button
				type="button"
				onClick={handleBookClick}
				aria-label={translate('event.bookTour')}
				title={translate('event.bookTour')}
				className={`${ACTION} ${solid}`}
			>
				<ArrowUpRight className="size-5" strokeWidth={2.5} />
			</button>
		);
	};

	const meta = (tone: string, strong: string, soft: string) => (
		<div className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs ${tone}`}>
			{occurrenceLabel && (
				<span className="flex min-w-0 items-center gap-1">
					<CalendarDays className="size-3.5 shrink-0" />
					<span className="truncate">{occurrenceLabel}</span>
				</span>
			)}
			{average !== null && (
				<span className={`flex items-center gap-1 font-semibold ${strong}`}>
					<Star className="size-3.5 fill-amber-400 text-amber-400" />
					{average}
					{ratingCount > 0 && <span className={`font-normal ${soft}`}>({ratingCount})</span>}
				</span>
			)}
		</div>
	);

	const price = (oldTone: string, fromTone: string) => (
		<div className="min-w-0 flex-1">
			{isDiscounted && (
				<span className="block text-xs">
					<span className={`mr-1 font-medium ${fromTone}`}>{translate('event.priceFrom')}</span>
					<span className={`line-through ${oldTone}`}>{formatCurrency(pricing.basePrice)}</span>
				</span>
			)}
			<span className="block text-lg leading-tight font-black whitespace-nowrap">
				{formatCurrency(pricing.fromPrice)}
			</span>
		</div>
	);

	return (
		<article className="group @container relative isolate flex flex-col">
			<Link
				href={localizePath(`/events/${event.id}`, locale)}
				aria-label={`View details for ${eventTranslation.title}`}
				className="focus-visible:ring-primary absolute inset-0 z-10 rounded-[1.75rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
			/>

			<div className="relative aspect-4/5 overflow-hidden rounded-[1.75rem] bg-gray-200 @min-[16rem]:aspect-3/4 dark:bg-neutral-800">
				<div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
					<EventImageWithFallback
						src={getEventCoverImageUrl(event) ?? ''}
						alt={eventTranslation.title}
					/>
				</div>
				<div className="pointer-events-none absolute inset-0 hidden bg-linear-to-t from-black/70 via-transparent to-transparent @min-[16rem]:block" />

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

				{showSpots && (
					<p className="absolute bottom-3 left-3 z-20 rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold text-white @min-[16rem]:hidden">
						{translate('event.onlySpotsLeft', { count: spotsLeft })}
					</p>
				)}

				<div className="pointer-events-none absolute inset-x-2 bottom-2 z-20 hidden flex-col gap-3 rounded-3xl bg-black/45 p-3.5 text-white backdrop-blur-md @min-[16rem]:flex">
					<div className="flex flex-col gap-1.5">
						{showSpots && (
							<p className="w-fit rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold">
								{translate('event.onlySpotsLeft', { count: spotsLeft })}
							</p>
						)}
						<h3 className="line-clamp-2 text-base leading-snug font-bold tracking-tight">
							{eventTranslation.title}
						</h3>
						{meta('text-white/80', 'text-white', 'text-white/70')}
					</div>
					<div className="h-px bg-white/15" />
					<div className="flex items-center justify-between gap-3" suppressHydrationWarning>
						{price('text-white/60', 'text-white/70')}
						{control(true)}
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-2 px-1 pt-3 @min-[16rem]:hidden">
				<h3 className="line-clamp-2 text-[15px] leading-snug font-bold tracking-tight text-gray-900 dark:text-white">
					{eventTranslation.title}
				</h3>
				{meta('text-gray-500 dark:text-gray-400', 'text-gray-900 dark:text-white', 'text-gray-400')}
				<div
					className="flex items-center justify-between gap-2 text-gray-900 dark:text-white"
					suppressHydrationWarning
				>
					{price('text-gray-400', 'text-gray-500 dark:text-gray-400')}
					{control(false)}
				</div>
			</div>
		</article>
	);
}
