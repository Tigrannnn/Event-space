'use client';

import { useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { getEventTranslation, REVIEW_CONFIG } from '@event-space/shared';
import { StarRatingInput, useMyReview, useSaveReview } from '@/features/reviews';
import Button from '@/components/ui/Buttons/Button';
import { useTranslation } from '@/hooks/translation';
import { useFormatDate } from '@/hooks/format';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen/LoadingScreen';

const fieldClassName =
	'focus:border-primary w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-900 outline-none dark:border-gray-600 dark:text-gray-100';

export default function ReviewPageContent({ bookingId }: { bookingId: string }) {
	const translate = useTranslation();
	const { formatDateTime } = useFormatDate();
	const navigation = useLocalizedNavigation();

	const { data: state, isLoading } = useMyReview(bookingId);
	const saveReview = useSaveReview(bookingId);

	const [rating, setRating] = useState(0);
	const [text, setText] = useState('');
	const [isStarted, setIsStarted] = useState(false);

	if (isLoading || !state) {
		return <LoadingScreen />;
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
					existing.status === 'PENDING'
						? translate('review.pendingNotice')
						: translate('review.thanks'),
			};
		}
		return null;
	};

	const blocked = notice();

	return (
		<div className="mx-auto w-full max-w-2xl px-4 py-10">
			<h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
				{translate('review.pageTitle')}
			</h1>

			{title && (
				<p className="mt-2 text-gray-500 dark:text-gray-400">
					{title}
					{state.occurrenceDate ? ` · ${formatDateTime(state.occurrenceDate)}` : ''}
				</p>
			)}

			{blocked ? (
				<div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
					{blocked.icon}
					<p>{blocked.text}</p>
					{existing && <p className="text-sm">{translate('review.yourRating')}: {existing.rating}/5</p>}
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
							{ reviewId: existing?.id, data: { rating, text: text.trim() || null } },
							{ onSuccess: () => navigation.push('/bookings') },
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
	);
}
