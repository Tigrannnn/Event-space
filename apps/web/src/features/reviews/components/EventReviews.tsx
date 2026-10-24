'use client';

import { useCallback, useMemo } from 'react';
import { averageRating, type Event } from '@event-space/shared';
import LoadMoreTrigger from '@/components/ui/LoadMoreTrigger';
import { useIntersectionObserver } from '@/hooks/observer/useIntersectionObserver';
import { useTranslation } from '@/hooks/translation';
import { useFormatDate } from '@/hooks/format';
import { useEventReviews } from '../hooks/useReviews';
import { StarRating } from './StarRating';

export function EventReviews({ event }: { event: Event }) {
	const translate = useTranslation();
	const { formatDateShort } = useFormatDate();

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useEventReviews(event.id);

	const reviews = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

	const loadMoreRef = useIntersectionObserver(
		useCallback(() => {
			if (hasNextPage && !isFetchingNextPage) {
				void fetchNextPage();
			}
		}, [hasNextPage, isFetchingNextPage, fetchNextPage]),
		{ enabled: hasNextPage && !isFetchingNextPage, rootMargin: '200px' },
	);

	const average = averageRating(event);

	// Nothing to show and nothing to explain: an empty heading only makes the tour look unloved.
	if (average === null && reviews.length === 0) {
		return null;
	}

	return (
		<section className="space-y-5">
			<div className="flex flex-wrap items-center gap-3">
				<h2 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
					{translate('review.sectionTitle')}
				</h2>
				{average !== null && (
					<span className="flex items-center gap-2">
						<span className="text-2xl font-black text-gray-900 dark:text-white">{average}</span>
						<StarRating value={average} size="md" />
						<span className="text-sm text-gray-500">
							{translate('review.count', { count: event.ratingCount ?? 0 })}
						</span>
					</span>
				)}
			</div>

			<ul className="space-y-4">
				{reviews.map((review) => (
					<li
						key={review.id}
						className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700"
					>
						<div className="flex flex-wrap items-center gap-2">
							<span className="font-semibold text-gray-900 dark:text-gray-100">
								{review.user?.name}
							</span>
							<StarRating value={review.rating} />
							<span className="text-xs text-gray-500">{formatDateShort(review.createdAt)}</span>
						</div>

						{review.text && (
							<p className="mt-2 text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
								{review.text}
							</p>
						)}

						{review.adminReply && (
							<div className="mt-3 rounded-xl bg-gray-100 p-3 dark:bg-gray-800">
								<p className="text-xs font-semibold text-gray-500 uppercase">
									{translate('review.companyReply')}
								</p>
								<p className="mt-1 text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
									{review.adminReply}
								</p>
							</div>
						)}
					</li>
				))}

				<LoadMoreTrigger
					isLoading={isFetchingNextPage}
					isEnabled={hasNextPage}
					loadMoreRef={loadMoreRef}
				/>
			</ul>
		</section>
	);
}
