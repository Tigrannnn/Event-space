'use client';

import { useCallback, useMemo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EventCard } from '@/features/events';
import EventsGridSkeleton from './EventsGridSkeleton';
import { useEvents } from '@/features/events';
import { useIntersectionObserver } from '@/hooks/observer/useIntersectionObserver';
import LoadMoreTrigger from '@/components/ui/LoadMoreTrigger';
import type { Event } from '@event-space/shared';
import HomeError from '../error';
import PageState from '@/components/ui/PageState';
import { useTranslation } from '@/hooks/translation';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useSkin } from '@/providers/BrandProvider';
import { CATALOGUE_FETCH_LIMIT, CATALOGUE_MOBILE_PAGE, cataloguePageSize, eventsGridClass } from './events-grid';
import {
	EventsFiltersBar,
	computePriceBounds,
	filterEventsByCategories,
	formatDateParam,
	getApiCategoryFilter,
	parseFiltersFromSearchParams,
} from './filters';
import { buildCatalogueHref } from './filters/catalogue-url';

interface EventsListProps {
	initialEvents: Event[];
	initialNextCursor?: string | null;
	initialHasMore?: boolean;
	searchQuery?: string;
	/** Set on a category page: the category lives in the path, not in the query string. */
	categorySlug?: string;
}

export default function EventsList({
	initialEvents,
	initialNextCursor = null,
	initialHasMore = false,
	searchQuery = '',
	categorySlug,
}: EventsListProps) {
	const translate = useTranslation();
	const skin = useSkin();
	const router = useRouter();
	const searchParams = useSearchParams();
	const locale = translate.locale;

	const filters = useMemo(() => {
		const parsed = parseFiltersFromSearchParams(searchParams);

		return categorySlug ? { ...parsed, categories: [categorySlug] } : parsed;
	}, [searchParams, categorySlug]);

	const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

	const handleFiltersChange = useCallback(
		(nextFilters: typeof filters) => {
			router.replace(buildCatalogueHref(locale, nextFilters, searchParams), { scroll: false });
		},
		[locale, router, searchParams],
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

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useEvents({
		limit: CATALOGUE_FETCH_LIMIT,
		search: searchQuery,
		startDate: filters.dateRange ? formatDateParam(filters.dateRange.from) : undefined,
		endDate: filters.dateRange ? formatDateParam(filters.dateRange.to) : undefined,
		category: getApiCategoryFilter(filters.categories),
		minPrice: filters.priceRange?.min,
		maxPrice: filters.priceRange?.max,
		guests: filters.guests ?? undefined,
		difficulties: filters.difficulties,
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

	// The loaded events are already narrowed by the price filter, so bounds read straight from them
	// shrink to the filter itself — and the slider can then no longer widen it again. The highest
	// price seen so far is kept instead, and the applied range always fits inside the bounds.
	const currentHighestPrice = Math.max(
		0,
		...(events.length > 0 ? events : initialEvents).map((event) => Number(event.price)),
		filters.priceRange?.max ?? 0,
	);
	const [highestPriceSeen, setHighestPriceSeen] = useState(currentHighestPrice);
	if (currentHighestPrice > highestPriceSeen) {
		setHighestPriceSeen(currentHighestPrice);
	}
	const highestPrice = Math.max(highestPriceSeen, currentHighestPrice);
	const priceBounds = useMemo(
		() => computePriceBounds(highestPrice > 0 ? [highestPrice] : []),
		[highestPrice],
	);

	const gridRef = useRef<HTMLDivElement>(null);
	const [pageSize, setPageSize] = useState(CATALOGUE_MOBILE_PAGE);
	const [steps, setSteps] = useState(1);
	const resetKey = JSON.stringify([searchQuery, categorySlug, filters]);
	const [seenResetKey, setSeenResetKey] = useState(resetKey);
	if (seenResetKey !== resetKey) {
		setSeenResetKey(resetKey);
		setSteps(1);
	}

	// The grid is measured rather than guessed from the skin and the breakpoint: it already knows
	// how many columns it has, so a step is always three whole rows.
	const hasEvents = filteredEvents.length > 0;
	useLayoutEffect(() => {
		const grid = gridRef.current;
		if (!grid) return;

		const measure = () => setPageSize(cataloguePageSize(grid));
		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(grid);
		return () => observer.disconnect();
	}, [hasEvents]);

	const visibleCount = steps * pageSize;
	const visibleEvents = filteredEvents.slice(0, visibleCount);
	const hasHiddenEvents = visibleCount < filteredEvents.length;

	// Keep one step in hand: the next batch is already loaded by the time the reader reaches it.
	useEffect(() => {
		if (hasNextPage && !isFetchingNextPage && filteredEvents.length < visibleCount + pageSize) {
			fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, filteredEvents.length, visibleCount, pageSize, fetchNextPage]);

	const loadMoreRef = useIntersectionObserver(
		useCallback(() => {
			if (hasHiddenEvents) setSteps((current) => current + 1);
		}, [hasHiddenEvents]),
		{
			enabled: hasHiddenEvents,
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
				<EventsGridSkeleton count={CATALOGUE_MOBILE_PAGE} />
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
			<div ref={gridRef} className={eventsGridClass(skin)}>
				{visibleEvents.map((event) => (
					<EventCard key={event.id} event={event} />
				))}
			</div>

			<LoadMoreTrigger
				isLoading={isFetchingNextPage && !hasHiddenEvents}
				isEnabled={hasHiddenEvents || hasNextPage}
				loadMoreRef={loadMoreRef}
			/>
		</div>
	);
}
