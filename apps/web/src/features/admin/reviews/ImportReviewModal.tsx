'use client';

import { useState } from 'react';
import {
	getEventTranslation,
	IMPORTABLE_REVIEW_SOURCES,
	REVIEW_CONFIG,
	type ReviewSource,
	zonedLocalInputToDate,
} from '@event-space/shared';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import Input from '@/components/ui/Inputs/Input';
import Select from '@/components/ui/Select';
import DateTimeField from '@/components/ui/DateTimeField';
import { StarRatingInput } from '@/features/reviews';
import { useAdminEvents, useImportReview } from '@/features/admin/hooks/useAdmin';
import { useModalStore } from '@/stores';
import { useTranslation } from '@/hooks/translation';

const textareaClassName =
	'focus:border-primary w-full rounded-md border border-gray-500 bg-transparent px-3 py-2 text-sm text-gray-900 outline-none dark:text-gray-100';

/** Brings in a review that was written on another site, and says where. */
export default function ImportReviewModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const { mutate: importReview, isPending } = useImportReview();
	const { data: eventsResponse } = useAdminEvents({ limit: 100 });
	const events = eventsResponse?.data ?? [];

	const [eventId, setEventId] = useState('');
	const [authorName, setAuthorName] = useState('');
	const [rating, setRating] = useState(0);
	const [source, setSource] = useState<ReviewSource>(IMPORTABLE_REVIEW_SOURCES[0]);
	const [reviewedAt, setReviewedAt] = useState('');
	const [text, setText] = useState('');

	const canSubmit = eventId !== '' && authorName.trim() !== '' && rating > 0;

	return (
		<Modal
			onClose={closeModal}
			size="md"
			ariaLabel={translate('admin.importReview')}
			disableBackdropClose={isPending}
			disableEscapeClose={isPending}
		>
			<form
				className="space-y-4"
				onSubmit={(event) => {
					event.preventDefault();
					if (!canSubmit) return;

					importReview({
						eventId,
						authorName: authorName.trim(),
						rating,
						text: text.trim() || null,
						source,
						reviewedAt: reviewedAt ? zonedLocalInputToDate(reviewedAt) : null,
					});
				}}
			>
				<ModalHeader title={translate('admin.importReview')} onClose={closeModal} />

				<p className="text-xs text-gray-500">{translate('admin.importReviewHint')}</p>

				<div className="space-y-1.5">
					<span className="text-sm font-semibold">{translate('admin.importReviewEvent')}</span>
					<Select
						value={eventId}
						onValueChange={setEventId}
						disabled={isPending}
						options={[
							{ value: '', label: translate('admin.importReviewSelectEvent'), disabled: true },
							...events.map((event) => ({
								value: event.id,
								label: getEventTranslation(event, translate.locale).title,
							})),
						]}
					/>
				</div>

				<div className="space-y-1.5">
					<span className="text-sm font-semibold">{translate('admin.importReviewSource')}</span>
					<Select
						value={source}
						onValueChange={(value) => setSource(value as ReviewSource)}
						disabled={isPending}
						options={IMPORTABLE_REVIEW_SOURCES.map((value) => ({
							value,
							label: translate(`review.source.${value}`),
						}))}
					/>
				</div>

				<Input
					label={translate('admin.importReviewAuthor')}
					value={authorName}
					onChange={(event) => setAuthorName(event.target.value)}
					maxLength={REVIEW_CONFIG.AUTHOR_NAME_MAX}
					disabled={isPending}
				/>

				<div className="space-y-1.5">
					<span className="text-sm font-semibold">{translate('review.ratingLabel')}</span>
					<StarRatingInput
						value={rating}
						onChange={setRating}
						disabled={isPending}
						label={(star) => translate('review.starsOf', { count: star })}
					/>
				</div>

				<div className="space-y-1.5">
					<span className="text-sm font-semibold">{translate('admin.importReviewDate')}</span>
					<DateTimeField value={reviewedAt} onChange={setReviewedAt} disabled={isPending} />
					<span className="block text-xs text-gray-500">{translate('admin.importReviewDateHint')}</span>
				</div>

				<label className="block space-y-1.5">
					<span className="text-sm font-semibold">{translate('review.textLabel')}</span>
					<textarea
						value={text}
						onChange={(event) => setText(event.target.value)}
						rows={5}
						maxLength={REVIEW_CONFIG.TEXT_MAX}
						className={textareaClassName}
						disabled={isPending}
					/>
				</label>

				<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<Button type="button" variant="secondary" onClick={closeModal} disabled={isPending}>
						{translate('common.cancel')}
					</Button>
					<Button type="submit" disabled={!canSubmit} isLoading={isPending}>
						{translate('admin.importReviewSubmit')}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
