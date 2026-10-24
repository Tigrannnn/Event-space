'use client';

import { useCallback, useMemo, useState } from 'react';
import type { ReviewStatus } from '@event-space/shared';
import Select from '@/components/ui/Select';
import LoadMoreTrigger from '@/components/ui/LoadMoreTrigger';
import { useIntersectionObserver } from '@/hooks/observer/useIntersectionObserver';
import { useTranslation } from '@/hooks/translation';
import { useAdminReviews } from '@/features/admin/hooks/useAdmin';
import ReviewCard from './ReviewCard';

type StatusFilter = 'ALL' | ReviewStatus;

export default function ReviewsQueue() {
	const translate = useTranslation();
	// Opens on the only thing that needs doing: everything else is already decided.
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useAdminReviews(
		statusFilter === 'ALL' ? undefined : statusFilter,
	);

	const reviews = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

	const loadMoreRef = useIntersectionObserver(
		useCallback(() => {
			if (hasNextPage && !isFetchingNextPage) {
				void fetchNextPage();
			}
		}, [hasNextPage, isFetchingNextPage, fetchNextPage]),
		{ enabled: hasNextPage && !isFetchingNextPage, rootMargin: '200px' },
	);

	return (
		<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
			<div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
				<div>
					<p className="text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100">
						{translate('admin.reviews')}
					</p>
					<p className="text-xs text-gray-500 sm:text-sm">{translate('admin.reviewsHint')}</p>
				</div>

				<Select
					variant="filter"
					size="sm"
					value={statusFilter}
					onValueChange={(value) => setStatusFilter(value as StatusFilter)}
					options={[
						{ value: 'PENDING', label: translate('admin.reviewsQueue') },
						{ value: 'PUBLISHED', label: translate('admin.reviewsPublished') },
						{ value: 'REJECTED', label: translate('admin.reviewsRejected') },
						{ value: 'ALL', label: translate('admin.reviewsAll') },
					]}
				/>
			</div>

			{reviews.length === 0 ? (
				<p className="px-3 py-8 text-center text-gray-500 sm:px-5">
					{translate('admin.noReviewsFound')}
				</p>
			) : (
				<ul className="divide-y divide-gray-200 dark:divide-gray-700">
					{reviews.map((review) => (
						<ReviewCard key={review.id} review={review} />
					))}

					<LoadMoreTrigger
						isLoading={isFetchingNextPage}
						isEnabled={hasNextPage}
						loadMoreRef={loadMoreRef}
					/>
				</ul>
			)}
		</div>
	);
}
