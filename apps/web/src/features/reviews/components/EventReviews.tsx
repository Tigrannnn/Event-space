'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Clock, EyeOff, Pencil } from 'lucide-react';
import { averageRating, type Event } from '@event-space/shared';
import LoadMoreTrigger from '@/components/ui/LoadMoreTrigger';
import { useIntersectionObserver } from '@/hooks/observer/useIntersectionObserver';
import { useTranslation } from '@/hooks/translation';
import { useFormatDate } from '@/hooks/format';
import { localizePath } from '@/lib/i18n/config';
import { useEventReviews } from '../hooks/useReviews';
import { DeleteReviewButton } from './DeleteReviewButton';
import { StarRating } from './StarRating';

export function EventReviews({ event }: { event: Event }) {
	const translate = useTranslation();
	const { formatDateShort } = useFormatDate();

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useEventReviews(event.id);

	const reviews = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
	const mine = data?.pages[0]?.mine ?? [];

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
	if (average === null && reviews.length === 0 && mine.length === 0) {
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
						<span className="text-2xl font-black text-gray-900 dark:text-white in-data-[skin=minimal]:font-semibold in-data-[skin=listing]:rounded-md in-data-[skin=listing]:rounded-bl-none in-data-[skin=listing]:bg-primary in-data-[skin=listing]:px-2 in-data-[skin=listing]:py-0.5 in-data-[skin=listing]:text-xl in-data-[skin=listing]:text-white in-data-[skin=market]:rounded-lg in-data-[skin=market]:bg-amber-100 in-data-[skin=market]:px-2 in-data-[skin=market]:py-0.5 in-data-[skin=market]:text-xl in-data-[skin=market]:font-bold in-data-[skin=market]:text-gray-900 in-data-[skin=market]:dark:bg-amber-400 in-data-[skin=market]:dark:text-gray-900">{average}</span>
						<StarRating value={average} size="md" />
						<span className="text-sm text-gray-500">
							{translate('review.count', { count: event.ratingCount ?? 0 })}
						</span>
					</span>
				)}
			</div>

			{mine.length > 0 && (
				<ul className="space-y-4">
					{mine.map((review) => (
						<li
							key={review.id}
							className="border-primary/40 bg-primary/5 rounded-2xl border p-4 in-data-[skin=minimal]:rounded-none in-data-[skin=minimal]:border-x-0 in-data-[skin=minimal]:border-t-0 in-data-[skin=minimal]:border-gray-200 in-data-[skin=minimal]:bg-transparent in-data-[skin=minimal]:px-0 in-data-[skin=minimal]:dark:border-neutral-800 in-data-[skin=listing]:rounded-md"
						>
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-primary text-xs font-bold tracking-wide uppercase">
									{translate('review.yours')}
								</span>
								<StarRating value={review.rating} />
								<span className="text-xs text-gray-500">
									{formatDateShort(review.createdAt)}
								</span>
								<Link
									href={localizePath(`/bookings/${review.bookingId}/review`, translate.locale)}
									className="text-primary ml-auto flex items-center gap-1 text-xs font-semibold hover:underline"
								>
									<Pencil className="h-3.5 w-3.5" />
									{translate('review.editAction')}
								</Link>
								<DeleteReviewButton bookingId={review.bookingId} />
							</div>

							{review.text && (
								<p className="mt-2 text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
									{review.text}
								</p>
							)}

							{review.status === 'PENDING' && (
								<p className="mt-2 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
									<Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
									{translate('review.onlyYouSeeIt')}
								</p>
							)}

							{review.status === 'REJECTED' && (
								<p className="mt-2 flex items-start gap-2 text-xs text-red-500">
									<EyeOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
									{review.rejectReason || translate('review.rejected')}
								</p>
							)}

							{review.adminReply && (
								<div className="mt-3 rounded-xl bg-gray-100 p-3 dark:bg-gray-800 in-data-[skin=minimal]:rounded-lg in-data-[skin=minimal]:dark:bg-neutral-900 in-data-[skin=listing]:rounded-md in-data-[skin=listing]:border-l-4 in-data-[skin=listing]:border-primary in-data-[skin=listing]:dark:bg-neutral-800">
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
				</ul>
			)}

			<ul className="space-y-4 in-data-[skin=market]:grid in-data-[skin=market]:gap-3 in-data-[skin=market]:space-y-0 in-data-[skin=market]:md:grid-cols-2">
				{reviews.map((review) => (
					<li
						key={review.id}
						className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700 in-data-[skin=minimal]:rounded-none in-data-[skin=minimal]:border-x-0 in-data-[skin=minimal]:border-t-0 in-data-[skin=minimal]:px-0 in-data-[skin=minimal]:pb-5 in-data-[skin=minimal]:dark:border-neutral-800 in-data-[skin=listing]:rounded-md in-data-[skin=listing]:bg-white in-data-[skin=listing]:dark:border-neutral-800 in-data-[skin=listing]:dark:bg-neutral-900 in-data-[skin=market]:border-0 in-data-[skin=market]:bg-gray-50 in-data-[skin=market]:dark:bg-neutral-800"
					>
						<div className="flex flex-wrap items-center gap-2">
							<span className="bg-primary hidden size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white uppercase in-data-[skin=market]:flex">
								{(review.user?.name ?? '?').trim().charAt(0)}
							</span>
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
							<div className="mt-3 rounded-xl bg-gray-100 p-3 dark:bg-gray-800 in-data-[skin=minimal]:rounded-lg in-data-[skin=minimal]:dark:bg-neutral-900 in-data-[skin=listing]:rounded-md in-data-[skin=listing]:border-l-4 in-data-[skin=listing]:border-primary in-data-[skin=listing]:dark:bg-neutral-800 in-data-[skin=market]:rounded-xl in-data-[skin=market]:border-l-4 in-data-[skin=market]:border-primary in-data-[skin=market]:bg-white in-data-[skin=market]:dark:bg-neutral-900">
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
