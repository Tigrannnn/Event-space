'use client';

import { useState } from 'react';
import { REVIEW_CONFIG, SYSTEM_CHANNEL_IDS, zonedLocalInputToDate } from '@event-space/shared';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import Input from '@/components/ui/Inputs/Input';
import DateTimeField from '@/components/ui/DateTimeField';
import { ReviewPhotoPicker, StarRatingInput, type ReviewPhotoSelection } from '@/features/reviews';
import { useImportReview } from '@/features/admin/hooks/useAdmin';
import EventSearchSelect from '@/features/admin/components/EventSearchSelect';
import ChannelSelect from '@/features/admin/components/ChannelSelect';
import { useModalStore } from '@/stores';
import { useTranslation } from '@/hooks/translation';

const textareaClassName =
	'focus:border-primary w-full rounded-md border border-gray-500 bg-transparent px-3 py-2 text-sm text-gray-900 outline-none dark:text-gray-100';

/** Brings in a review that was written on another site, and says where. */
export default function ImportReviewModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const { mutate: importReview, isPending } = useImportReview();

	const [eventId, setEventId] = useState('');
	const [authorName, setAuthorName] = useState('');
	const [rating, setRating] = useState(0);
	const [channelId, setChannelId] = useState<string>(SYSTEM_CHANNEL_IDS.UNSPECIFIED);
	const [reviewedAt, setReviewedAt] = useState('');
	const [photos, setPhotos] = useState<ReviewPhotoSelection>({ keptIds: [], files: [] });
	const [text, setText] = useState('');

	const canSubmit =
		eventId !== '' &&
		authorName.trim() !== '' &&
		rating > 0 &&
		channelId !== '';

	return (
		<Modal
			onClose={closeModal}
			size="lg"
			ariaLabel={translate('admin.importReview')}
			disableBackdropClose={isPending}
			disableEscapeClose={isPending}
		>
			<form
				className="space-y-5 p-4 sm:p-6"
				onSubmit={(event) => {
					event.preventDefault();
					if (!canSubmit) return;

					importReview({
						data: {
							eventId,
							authorName: authorName.trim(),
							rating,
							text: text.trim() || null,
							channelId,
							reviewedAt: reviewedAt ? zonedLocalInputToDate(reviewedAt) : null,
						},
						files: photos.files,
					});
				}}
			>
				<ModalHeader title={translate('admin.importReview')} onClose={closeModal} />

				<p className="text-xs text-gray-500">{translate('admin.importReviewHint')}</p>

				<EventSearchSelect
					value={eventId}
					onChange={(id) => setEventId(id)}
					label={translate('admin.eventField')}
				/>

				<ChannelSelect
					use="reviews"
					value={channelId}
					onChange={setChannelId}
					label={translate('admin.importReviewSource')}
					disabled={isPending}
				/>

				<Input
					label={translate('admin.importReviewAuthor')}
					value={authorName}
					onChange={(event) => setAuthorName(event.target.value)}
					maxLength={REVIEW_CONFIG.AUTHOR_NAME_MAX}
					disabled={isPending}
				/>

				<div className="flex flex-col gap-1.5">
					<span className="text-sm font-semibold">{translate('review.ratingLabel')}</span>
					<StarRatingInput
						value={rating}
						onChange={setRating}
						disabled={isPending}
						label={(star) => translate('review.starsOf', { count: star })}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<span className="text-sm font-semibold">{translate('admin.importReviewDate')}</span>
					<DateTimeField value={reviewedAt} onChange={setReviewedAt} disabled={isPending} />
					<span className="block text-xs text-gray-500">{translate('admin.importReviewDateHint')}</span>
				</div>

				<label className="flex flex-col gap-1.5">
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

				<ReviewPhotoPicker onChange={setPhotos} disabled={isPending} />

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
