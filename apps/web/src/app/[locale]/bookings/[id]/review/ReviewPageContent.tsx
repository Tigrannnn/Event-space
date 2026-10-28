'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { getEventTranslation, REVIEW_CONFIG } from '@event-space/shared';
import { StarRatingInput, useMyReview, useSaveReview } from '@/features/reviews';
import Button from '@/components/ui/Buttons/Button';
import { useTranslation } from '@/hooks/translation';
import { useFormatDate } from '@/hooks/format';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useSkin } from '@/providers/BrandProvider';
import { cn } from '@/utils/cn';
import ReviewFormSkeleton from './ReviewFormSkeleton';

const fieldClassName =
	'focus:border-primary w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-900 outline-none dark:border-gray-600 dark:text-gray-100 in-data-[skin=minimal]:bg-white in-data-[skin=minimal]:focus:border-gray-900 in-data-[skin=minimal]:dark:border-neutral-700 in-data-[skin=minimal]:dark:bg-neutral-950 in-data-[skin=listing]:rounded-md in-data-[skin=listing]:bg-white in-data-[skin=listing]:dark:border-neutral-700 in-data-[skin=listing]:dark:bg-neutral-900 in-data-[skin=soft]:rounded-2xl in-data-[skin=soft]:border-gray-200 in-data-[skin=soft]:bg-white in-data-[skin=soft]:dark:bg-gray-800';

const noticeClassName =
	'flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400 in-data-[skin=minimal]:rounded-none in-data-[skin=minimal]:border-x-0 in-data-[skin=minimal]:border-solid in-data-[skin=minimal]:border-gray-200 in-data-[skin=minimal]:dark:border-neutral-800 in-data-[skin=listing]:rounded-lg in-data-[skin=listing]:border-solid in-data-[skin=listing]:border-gray-200 in-data-[skin=listing]:bg-white in-data-[skin=listing]:dark:border-neutral-800 in-data-[skin=listing]:dark:bg-neutral-900 in-data-[skin=soft]:rounded-[2rem] in-data-[skin=soft]:border-gray-300 in-data-[skin=soft]:bg-white in-data-[skin=soft]:dark:border-gray-600 in-data-[skin=soft]:dark:bg-gray-800';

export default function ReviewPageContent({ bookingId }: { bookingId: string }) {
	const searchParams = useSearchParams();
	// Two ways in: signed in, or holding the link we emailed. A guest booked by hand has no
	// account at all, so the link is the only one they will ever have.
	const token = searchParams.get('t') ?? undefined;
	const presetRating = Number(searchParams.get('rating'));
	const translate = useTranslation();
	const { formatDateTime } = useFormatDate();
	const navigation = useLocalizedNavigation();
	const skin = useSkin();

	const { data: state, isLoading, isError, refetch, isFetching } = useMyReview(bookingId, token);
	const saveReview = useSaveReview(bookingId, token);

	// A star tapped in the email arrives as ?rating=4, so the form opens already answered.
	const [rating, setRating] = useState(
		Number.isInteger(presetRating) && presetRating >= 1 && presetRating <= 5 ? presetRating : 0,
	);
	const [text, setText] = useState('');
	const [isStarted, setIsStarted] = useState(false);

	if (isLoading) {
		return <ReviewFormSkeleton />;
	}

	// Without this the page spun forever on any failure — an expired session, a link that is
	// not ours, the API having a bad minute — because there was nothing to render but the
	// loader while `state` stayed undefined.
	if (isError || !state) {
		return (
			<div className="mx-auto w-full max-w-2xl px-4 py-10">
				<div className={noticeClassName}>
					<AlertTriangle className="h-10 w-10" />
					<p>{translate('review.loadFailed')}</p>
					<div className="flex flex-col gap-3 sm:flex-row">
						<Button onClick={() => void refetch()} isLoading={isFetching}>
							{translate('review.retry')}
						</Button>
						<Button variant="secondary" onClick={() => navigation.push('/bookings')}>
							{translate('review.backToBookings')}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const existing = state.review;
	// The stored review seeds the form once, without an effect: later keystrokes are the state.
	if (existing && !isStarted) {
		setIsStarted(true);
		setRating(existing.rating);
		setText(existing.text ?? '');
	}

	const title = state.event ? getEventTranslation(state.event, translate.locale).title : '';

	const isEditable = state.window === 'OPEN' && (!existing || state.canEdit);

	const notice = () => {
		if (state.window === 'TOO_EARLY') {
			return {
				icon: <Clock className="h-10 w-10" />,
				text: state.opensAt
					? translate('review.tooEarlyAt', { date: formatDateTime(state.opensAt) })
					: translate('review.tooEarly'),
			};
		}
		if (state.window === 'CLOSED') {
			return { icon: <Clock className="h-10 w-10" />, text: translate('review.windowClosed') };
		}
		if (state.window === 'NOT_ELIGIBLE') {
			return { icon: <Clock className="h-10 w-10" />, text: translate('review.notEligible') };
		}
		if (existing && !state.canEdit) {
			return {
				icon: <CheckCircle2 className="h-10 w-10" />,
				text:
					existing.status === 'PENDING' ? translate('review.pendingNotice') : translate('review.thanks'),
			};
		}
		return null;
	};

	const blocked = notice();

	return (
		<div className={cn('mx-auto w-full max-w-2xl px-4 py-10', skin === 'minimal' && 'max-w-xl')}>
			<div
				className={cn(
					skin === 'listing' &&
						'rounded-lg border border-gray-200 bg-white p-5 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900',
					skin === 'soft' && 'rounded-[2rem] bg-white p-6 shadow-md sm:p-10 dark:bg-gray-800',
				)}
			>
				<h1
					className={cn(
						'text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white',
						skin === 'minimal' && 'font-semibold tracking-tight',
						skin === 'soft' && 'text-primary',
					)}
				>
					{translate('review.pageTitle')}
				</h1>

				{title && (
					<p className="mt-2 text-gray-500 dark:text-gray-400">
						{title}
						{state.occurrenceDate ? ` · ${formatDateTime(state.occurrenceDate)}` : ''}
					</p>
				)}

				{blocked ? (
					<div className={cn(noticeClassName, 'mt-10')}>
						{blocked.icon}
						<p>{blocked.text}</p>
						{existing && (
							<p className="text-sm">
								{translate('review.yourRating')}: {existing.rating}/5
							</p>
						)}
						<Button variant="secondary" onClick={() => navigation.push('/bookings')}>
							{translate('review.backToBookings')}
						</Button>
					</div>
				) : (
					<form
						className="mt-8 space-y-6"
						onSubmit={(formEvent) => {
							formEvent.preventDefault();
							if (rating === 0) return;

							saveReview.mutate(
								{ isUpdate: Boolean(existing), data: { rating, text: text.trim() || null } },
								{
								// Back to the tour that was just reviewed, where the review now shows.
								onSuccess: () =>
									navigation.push(state.event ? `/events/${state.event.id}` : '/bookings'),
							},
							);
						}}
					>
						<div>
							<p className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
								{translate('review.ratingLabel')}
							</p>
							<StarRatingInput
								value={rating}
								onChange={setRating}
								disabled={saveReview.isPending}
								label={(star) => translate('review.starsOf', { count: star })}
							/>
						</div>

						<label className="block space-y-2">
							<span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
								{translate('review.textLabel')}
							</span>
							<span className="block text-xs text-gray-500">{translate('review.textHint')}</span>
							<textarea
								value={text}
								onChange={(changeEvent) => setText(changeEvent.target.value)}
								rows={6}
								maxLength={REVIEW_CONFIG.TEXT_MAX}
								className={fieldClassName}
								disabled={saveReview.isPending}
							/>
						</label>

						<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
							<Button
								type="button"
								variant="secondary"
								onClick={() => navigation.push('/bookings')}
								disabled={saveReview.isPending}
							>
								{translate('review.cancel')}
							</Button>
							<Button type="submit" disabled={rating === 0} isLoading={saveReview.isPending}>
								{existing ? translate('review.update') : translate('review.submit')}
							</Button>
						</div>

						{!isEditable && existing && (
							<p className="text-xs text-gray-500">{translate('review.editWindowOver')}</p>
						)}
					</form>
				)}
			</div>
		</div>
	);
}
