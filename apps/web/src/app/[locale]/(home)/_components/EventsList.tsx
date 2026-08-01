'use client';

import { useCallback, useMemo, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { EventCard } from '@/features/events';
import EventsGridSkeleton from './EventsGridSkeleton';
import { useEvents } from '@/features/events';
import { useIntersectionObserver } from '@/hooks/observer/useIntersectionObserver';
import LoadMoreTrigger from './LoadMoreTrigger';
import type { Event } from '@event-space/shared';
import HomeError from '../error';
import PageState from '@/components/ui/PageState';
import { useTranslation } from '@/hooks/translation';
import { useCategories } from '@/features/categories/hooks/useCategories';
import {
	EventsFiltersBar,
	computePriceBounds,
	filterEventsByCategories,
	filtersToSearchParams,
	formatDateParam,
	getApiCategoryFilter,
	parseFiltersFromSearchParams,
} from './filters';

interface EventsListProps {
	initialEvents: Event[];
	initialNextCursor?: string | null;
	initialHasMore?: boolean;
	searchQuery?: string;
}

export default function EventsList({
	initialEvents,
	initialNextCursor = null,
	initialHasMore = false,
	searchQuery = '',
}: EventsListProps) {
	const translate = useTranslation();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const locale = translate.locale;

	const filters = useMemo(
		() => parseFiltersFromSearchParams(searchParams),
		[searchParams],
	);

	const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

	const handleFiltersChange = useCallback(
		(nextFilters: typeof filters) => {
			const params = filtersToSearchParams(searchParams, nextFilters);
			router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, {
				scroll: false,
			});
		},
		[pathname, router, searchParams],
	);

	const initialData = useMemo(() => {
		if (!initialEvents.length) return undefined;
		return {
			pages: [
				{
					data: initialEvents,
					nextCursor: initialNextCursor,
					hasMore: initialHasMore,
				},
			],
			pageParams: [undefined as string | undefined],
		};
	}, [initialEvents, initialNextCursor, initialHasMore]);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useEvents({
		limit: 8,
		search: searchQuery,
		startDate: filters.dateRange ? formatDateParam(filters.dateRange.from) : undefined,
		endDate: filters.dateRange ? formatDateParam(filters.dateRange.to) : undefined,
		category: getApiCategoryFilter(filters.categories),
		minPrice: filters.priceRange?.min,
		maxPrice: filters.priceRange?.max,
		guests: filters.guests ?? undefined,
		initialData,
	});

	const events = useMemo(() => {
		if (!data?.pages) return [];
		return data.pages.flatMap((page) => page.data);
	}, [data]);

	const filteredEvents = useMemo(
		() => filterEventsByCategories(events, filters.categories),
		[events, filters.categories],
	);

	const priceBounds = useMemo(() => {
		const sourceEvents = events.length > 0 ? events : initialEvents;
		return computePriceBounds(sourceEvents.map((event) => Number(event.price)));
	}, [events, initialEvents]);

	const loadMoreRef = useIntersectionObserver(
		useCallback(() => {
			if (hasNextPage && !isFetchingNextPage) {
				fetchNextPage();
			}
		}, [hasNextPage, isFetchingNextPage, fetchNextPage]),
		{
			enabled: hasNextPage && !isFetchingNextPage,
			rootMargin: '200px',
		},
	);

	useEffect(() => {
		// TanStack Query автоматически перезапросит при изменении queryKey
	}, [searchQuery, filters]);

	const filtersBar = (
		<EventsFiltersBar
			categories={categories}
			priceBounds={priceBounds}
			filters={filters}
			onFiltersChange={handleFiltersChange}
			isLoadingCategories={isLoadingCategories}
		/>
	);

	if (isLoading && !data) {
		return (
			<div>
				{filtersBar}
				<EventsGridSkeleton count={8} />
			</div>
		);
	}

	if (isError) {
		return (
			<div>
				{filtersBar}
				<HomeError />
			</div>
		);
	}

	if (!filteredEvents.length) {
		return (
			<div>
				{filtersBar}
				<PageState>
					<div className="rounded-2xl border border-gray-100 bg-white p-6 text-center sm:rounded-[2.5rem] sm:p-10 dark:border-gray-700 dark:bg-gray-800">
						<p className="text-primary mb-2 text-lg font-black uppercase sm:text-xl">
							{searchQuery ? translate('common.noEventsFound') : translate('common.noEventsYet')}
						</p>
						<p className="text-[15px] text-gray-500 sm:text-sm dark:text-gray-400">
							{searchQuery
								? `${translate('common.noEventsFound')}: "${searchQuery}". ${translate('common.noEventsSearchDescription')}`
								: translate('common.noEventsDescription')}
						</p>
					</div>
				</PageState>
			</div>
		);
	}

	return (
		<div>
			{filtersBar}
			<div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 sm:gap-6 sm:py-6 lg:grid-cols-3 lg:gap-8 2xl:grid-cols-4">
				{filteredEvents.map((event) => (
					<EventCard key={event.id} event={event} />
				))}
			</div>

			<LoadMoreTrigger
				isLoading={isFetchingNextPage}
				isEnabled={hasNextPage}
				loadMoreRef={loadMoreRef}
			/>

			{!hasNextPage && filteredEvents.length > 0 && (
				<div className="col-span-full py-8 text-center text-sm text-gray-400 dark:text-gray-500">
					{translate('common.noEventsDescription')}
				</div>
			)}
		</div>
	);
}
