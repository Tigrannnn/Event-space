'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useBookingView, useMyBookings } from '../../../features/bookings/hooks/useBookings';
import BookingCard from '../../../features/bookings/components/BookingCard';
import BookingsSkeleton from './BookingsSkeleton';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { CalendarX, ChevronDown, Filter, Ticket } from 'lucide-react';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useTranslation } from '@/hooks/translation';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useSkin } from '@/providers/BrandProvider';
import { type BookingDisplayStatus } from '@event-space/shared';
import LoadMoreTrigger from '@/components/ui/LoadMoreTrigger';
import { useIntersectionObserver } from '@/hooks/observer/useIntersectionObserver';

type StatusFilter = 'ALL' | BookingDisplayStatus;

/** How long the booking someone was sent to stays lit. */
const HIGHLIGHT_MS = 5000;

export default function BookingsPageContent() {
	const translate = useTranslation();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { locale } = useTranslation();
	const navigation = useLocalizedNavigation();
	const skin = useSkin();
	const isListing = skin === 'listing';
	const isMinimal = skin === 'minimal';
	const isSoft = skin === 'soft';
	const isMarket = skin === 'market';
	const isDrawer = skin === 'drawer';
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
	const {
		data,
		isLoading,
		isFetching,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useMyBookings(statusFilter === 'ALL' ? undefined : statusFilter);

	const loadedBookings = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

	// The booking a button or an email pointed at. It is kept in state because the address is
	// cleaned up straight away, so a refresh does not light the card up all over again. It stays
	// for as long as the page does: the card pinned above the list is drawn from it, so letting
	// go of it after the scroll would take the card away again.
	const [focusId, setFocusId] = useState<string | null>(null);
	const [highlightedId, setHighlightedId] = useState<string | null>(null);
	const scrolledForRef = useRef<string | null>(null);

	useEffect(() => {
		const id = searchParams.get('booking');
		if (!id) return;

		setFocusId(id);
		scrolledForRef.current = null;
		setStatusFilter('ALL');
		window.history.replaceState(null, '', window.location.pathname);
	}, [searchParams]);

	// When the booking is not in the page that has loaded, it is fetched on its own and shown
	// above the list, instead of paging through the whole list to find it.
	const isFocusLoaded = focusId ? loadedBookings.some((entry) => entry.id === focusId) : false;
	// Not until the list has finished (re)loading: a booking made a moment ago is missing from
	// the copy kept from the last visit, and pinning it only to have it jump into the list
	// a second later would be worse than waiting.
	const isListSettled = !isLoading && !(isFetching && !isFetchingNextPage);
	const { data: pinnedBooking } = useBookingView(
		focusId ?? '',
		undefined,
		Boolean(focusId) && isListSettled && !isFocusLoaded,
	);
	const pinned = focusId && !isFocusLoaded && pinnedBooking?.id === focusId ? pinnedBooking : null;
	const bookings = useMemo(
		() => (pinned ? loadedBookings.filter((entry) => entry.id !== pinned.id) : loadedBookings),
		[loadedBookings, pinned],
	);

	useEffect(() => {
		if (!focusId || scrolledForRef.current === focusId) return;

		const card = document.getElementById(`booking-${focusId}`);
		if (!card) return;

		scrolledForRef.current = focusId;
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		card.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
		setHighlightedId(focusId);
	}, [focusId, isFocusLoaded, pinned]);

	useEffect(() => {
		if (!highlightedId) return;

		const timer = window.setTimeout(() => setHighlightedId(null), HIGHLIGHT_MS);
		return () => window.clearTimeout(timer);
	}, [highlightedId]);

	const loadMoreRef = useIntersectionObserver(
		useCallback(() => {
			if (hasNextPage && !isFetchingNextPage) {
				void fetchNextPage();
			}
		}, [hasNextPage, isFetchingNextPage, fetchNextPage]),
		{ enabled: hasNextPage && !isFetchingNextPage, rootMargin: '200px' },
	);

	useEffect(() => {
		const paymentStatus = searchParams.get('payment');
		const redirectStatus = searchParams.get('redirect_status');

		if (paymentStatus === 'success' || redirectStatus === 'succeeded') {
			addToast(translate('booking.paymentSuccess'), ToastType.SUCCESS);
			void queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
			void queryClient.invalidateQueries({ queryKey: ['events'] });
			navigation.push('/bookings');
		}
	}, [searchParams, addToast, queryClient, locale, navigation, translate]);

	if (isLoading) {
		return <BookingsSkeleton />;
	}

	// The empty state speaks for the whole account, so it may only replace the page when nothing
	// is filtered out — otherwise "you have no bookings" would greet someone whose bookings are
	// simply all cancelled.
	if (bookings.length === 0 && statusFilter === 'ALL') {
		return (
			<EmptyState
				icon={CalendarX}
				title={translate('booking.noBookings')}
				description={translate('booking.noBookingsDescription')}
				actionLabel={translate('booking.browseEvents')}
				onAction={() => navigation.push('/')}
			/>
		);
	}

	return (
		<div
			className={
				isListing
					? 'mx-auto min-h-full w-full max-w-[1336px] px-4 py-6 sm:px-6 lg:px-8'
					: isDrawer
						? 'mx-auto min-h-full w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8'
						: isSoft
						? 'mx-auto min-h-full w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8'
						: isMarket
							? 'mx-auto min-h-full w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8'
							: 'min-h-full max-w-full px-4 py-8'
			}
		>
			<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900 dark:text-white in-data-[skin=drawer]:text-4xl in-data-[skin=drawer]:font-black in-data-[skin=drawer]:tracking-tight">
					{isSoft && (
						<span className="bg-accent/10 text-accent flex size-11 items-center justify-center rounded-full">
							<Ticket className="size-5" />
						</span>
					)}
					{translate('booking.myBookings')}
				</h1>
				<div
					className={`relative flex items-center border ${
						isListing
							? 'rounded-md border-gray-300 bg-white dark:border-neutral-700 dark:bg-neutral-900'
							: isDrawer
								? 'rounded-full border-transparent bg-white dark:bg-neutral-900'
							: isMinimal
								? 'rounded-full border-gray-300 bg-white hover:border-gray-900 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-gray-300'
								: isMarket
									? 'rounded-xl border-gray-300 bg-white dark:border-neutral-700 dark:bg-neutral-900'
									: 'rounded-full border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'
					}`}
				>
					<Filter className="pointer-events-none absolute left-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
						className="w-full cursor-pointer appearance-none rounded-[inherit] bg-transparent py-2 pr-10 pl-9 text-sm font-medium text-gray-700 outline-none dark:text-gray-200"
					>
						<option value="ALL">{translate('booking.filterAll')}</option>
						<option value="CONFIRMED">{translate('booking.filterConfirmed')}</option>
						<option value="CHECKED_IN">{translate('booking.filterCheckedIn')}</option>
						<option value="PENDING">{translate('booking.filterPending')}</option>
						<option value="CANCELLED">{translate('booking.filterCancelled')}</option>
					</select>
					<ChevronDown className="pointer-events-none absolute right-4 h-4 w-4 text-gray-500 dark:text-gray-400" />
				</div>
			</div>

			{bookings.length === 0 ? (
				<div
					className={`p-8 text-center text-sm text-gray-500 dark:text-gray-400 ${
						isListing
							? 'rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
							: isDrawer
								? 'rounded-[2rem] bg-white dark:bg-neutral-900'
							: isMinimal
								? 'border-y border-gray-200 py-12 dark:border-neutral-800'
								: isMarket
									? 'rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
									: 'rounded-2xl border border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/70'
					}`}
				>
					{translate('booking.noBookingsMatchFilter')}
				</div>
			) : (
				<div
					className={
						isListing
							? 'grid grid-cols-1 gap-4 xl:grid-cols-2'
							: isSoft
								? 'grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:grid-cols-4'
								: isDrawer
									? 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3'
								: isMarket
									? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
									: 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
					}
				>
					{pinned && (
						<BookingCard
							key={pinned.id}
							booking={pinned}
							highlighted={highlightedId === pinned.id}
						/>
					)}
					{bookings.map((booking) => (
						<BookingCard
							key={booking.id}
							booking={booking}
							highlighted={highlightedId === booking.id}
						/>
					))}

					<LoadMoreTrigger
						isLoading={isFetchingNextPage}
						isEnabled={hasNextPage}
						loadMoreRef={loadMoreRef}
					/>
				</div>
			)}
		</div>
	);
}
