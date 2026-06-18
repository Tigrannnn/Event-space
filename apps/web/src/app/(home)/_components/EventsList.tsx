'use client';

import { useCallback, useMemo, useEffect } from 'react';
import { EventCard } from '@/features/events';
import EventsGridSkeleton from './EventsGridSkeleton';
import { useEvents } from '@/features/events';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import LoadMoreTrigger from './LoadMoreTrigger';
import type { Event } from '@event-space/shared';
import HomeError from '../error';
import PageState from '@/components/ui/PageState';

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
	// Build initialData for TanStack Query hydration from SSR
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
		initialData,
	});

	// Flatten pages from infinite query
	const events = useMemo(() => {
		if (data?.pages) {
			return data.pages.flatMap((page) => page.data);
		}
		return [];
	}, [data]);

	// Intersection observer for infinite scroll
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

	// Reset query when search changes
	useEffect(() => {
		// TanStack Query автоматически перезапросит при изменении queryKey
	}, [searchQuery]);

	// Loading state (initial)
	if (isLoading && !data) {
		return <EventsGridSkeleton count={8} />;
	}

	// Error state
	if (isError) {
		return <HomeError />;
	}

	// Empty state
	if (!events?.length) {
		return (
			<PageState>
				<div className="rounded-2xl border border-gray-100 bg-white p-6 text-center sm:rounded-[2.5rem] sm:p-10 dark:border-gray-700 dark:bg-gray-800">
					<p className="text-primary mb-2 text-lg font-black uppercase sm:text-xl">
						{searchQuery ? 'No Events Found' : 'No Events Yet'}
					</p>
					<p className="text-[15px] text-gray-500 sm:text-sm dark:text-gray-400">
						{searchQuery
							? `No events matching "${searchQuery}". Try different search terms.`
							: 'Check back later for upcoming events.'}
					</p>
				</div>
			</PageState>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 sm:gap-6 sm:py-6 lg:grid-cols-3 lg:gap-8 2xl:grid-cols-4">
			{events.map((event) => (
				<EventCard key={event.id} event={event} />
			))}

			<LoadMoreTrigger
				isLoading={isFetchingNextPage}
				isEnabled={hasNextPage}
				loadMoreRef={loadMoreRef}
			/>

			{/* End of list indicator */}
			{!hasNextPage && events.length > 0 && (
				<div className="col-span-full py-8 text-center text-sm text-gray-400 dark:text-gray-500">
					No more events to show
				</div>
			)}
		</div>
	);
}
