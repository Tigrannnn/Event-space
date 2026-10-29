'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useMyBookings } from '../../../features/bookings/hooks/useBookings';
import BookingCard from '../../../features/bookings/components/BookingCard';
import BookingsSkeleton from './BookingsSkeleton';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { CalendarX, Filter, Ticket } from 'lucide-react';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useTranslation } from '@/hooks/translation';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useSkin } from '@/providers/BrandProvider';
import { type BookingDisplayStatus } from '@event-space/shared';
import LoadMoreTrigger from '@/components/ui/LoadMoreTrigger';
import { useIntersectionObserver } from '@/hooks/observer/useIntersectionObserver';

type StatusFilter = 'ALL' | BookingDisplayStatus;

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
	const isMarket = skin === 'market' || skin === 'drawer';
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useMyBookings(statusFilter === 'ALL' ? undefined : statusFilter);

	const bookings = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

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
					: isSoft
						? 'mx-auto min-h-full w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8'
						: isMarket
							? 'mx-auto min-h-full w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8'
							: 'min-h-full max-w-full px-4 py-8'
			}
		>
			<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900 dark:text-white">
					{isSoft && (
						<span className="bg-accent/10 text-accent flex size-11 items-center justify-center rounded-full">
							<Ticket className="size-5" />
						</span>
					)}
					{translate('booking.myBookings')}
				</h1>
				<div
					className={`flex items-center gap-2 border px-3 py-2 ${
						isListing
							? 'rounded-md border-gray-300 bg-white dark:border-neutral-700 dark:bg-neutral-900'
							: isMinimal
								? 'rounded-full border-gray-300 bg-white hover:border-gray-900 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-gray-300'
								: isMarket
									? 'rounded-xl border-gray-300 bg-white dark:border-neutral-700 dark:bg-neutral-900'
									: 'rounded-full border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'
					}`}
				>
					<Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
						className="cursor-pointer bg-transparent text-sm font-medium text-gray-700 outline-none dark:text-gray-200"
					>
						<option value="ALL">{translate('booking.filterAll')}</option>
						<option value="CONFIRMED">{translate('booking.filterConfirmed')}</option>
						<option value="CHECKED_IN">{translate('booking.filterCheckedIn')}</option>
						<option value="PENDING">{translate('booking.filterPending')}</option>
						<option value="CANCELLED">{translate('booking.filterCancelled')}</option>
					</select>
				</div>
			</div>

			{bookings.length === 0 ? (
				<div
					className={`p-8 text-center text-sm text-gray-500 dark:text-gray-400 ${
						isListing
							? 'rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
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
								: isMarket
									? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
									: 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
					}
				>
					{bookings.map((booking) => (
						<BookingCard key={booking.id} booking={booking} />
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
