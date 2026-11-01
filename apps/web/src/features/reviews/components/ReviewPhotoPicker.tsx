'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { REVIEW_CONFIG, type ReviewImage } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

export interface ReviewPhotoSelection {
	/** Photos already on the review that stay. */
	keptIds: string[];
	/** Photos picked just now, in the order shown. */
	files: File[];
}

interface ReviewPhotoPickerProps {
	existing?: ReviewImage[];
	onChange: (selection: ReviewPhotoSelection) => void;
	disabled?: boolean;
}

interface Added {
	file: File;
	previewUrl: string;
}

const MAX_BYTES = REVIEW_CONFIG.MAX_IMAGE_FILE_SIZE_BYTES;

/** Up to three photos for a review: the ones already there, then whatever is picked now. */
export function ReviewPhotoPicker({ existing = [], onChange, disabled }: ReviewPhotoPickerProps) {
	const translate = useTranslation();
	const inputRef = useRef<HTMLInputElement>(null);
	const [kept, setKept] = useState<ReviewImage[]>(existing);
	const [added, setAdded] = useState<Added[]>([]);
	const [error, setError] = useState<string | null>(null);

	const count = kept.length + added.length;

	useEffect(() => {
		onChange({ keptIds: kept.map((image) => image.id), files: added.map((item) => item.file) });
		// The parent only needs the result, not to be a dependency of it.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [kept, added]);

	useEffect(() => {
		return () => {
			for (const item of added) URL.revokeObjectURL(item.previewUrl);
		};
		// Only on leaving: what is dropped earlier is revoked where it is dropped.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const pick = (list: FileList | null) => {
		if (!list?.length) return;
		setError(null);

		const room = REVIEW_CONFIG.MAX_IMAGES - count;
		const images = Array.from(list).filter((file) => file.type.startsWith('image/'));
		const fitting = images.filter((file) => file.size <= MAX_BYTES);

		if (fitting.length < images.length) setError(translate('review.photoTooLarge'));
		else if (images.length > room) setError(translate('review.photoLimit'));

		setAdded((current) => [
			...current,
			...fitting.slice(0, room).map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
		]);

		if (inputRef.current) inputRef.current.value = '';
	};

	const tile =
		'relative size-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-800';
	const remove =
		'absolute top-1 right-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80';

	return (
		<div className="space-y-2">
			<span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
				{translate('review.photosLabel')}
			</span>
			<span className="block text-xs text-gray-500">
				{translate('review.photosHint', { count: REVIEW_CONFIG.MAX_IMAGES })}
			</span>

			<div className="flex flex-wrap gap-3">
				{kept.map((image) => (
					<div key={image.id} className={tile}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={image.url} alt="" className="size-full object-cover" />
						<button
							type="button"
							disabled={disabled}
							onClick={() => setKept((current) => current.filter((item) => item.id !== image.id))}
							aria-label={translate('review.removePhoto')}
							className={remove}
						>
							<X className="size-4" />
						</button>
					</div>
				))}

				{added.map((item) => (
					<div key={item.previewUrl} className={tile}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={item.previewUrl} alt="" className="size-full object-cover" />
						<button
							type="button"
							disabled={disabled}
							onClick={() => {
								URL.revokeObjectURL(item.previewUrl);
								setAdded((current) => current.filter((other) => other !== item));
							}}
							aria-label={translate('review.removePhoto')}
							className={remove}
						>
							<X className="size-4" />
						</button>
					</div>
				))}

				{count < REVIEW_CONFIG.MAX_IMAGES && (
					<button
						type="button"
						disabled={disabled}
						onClick={() => inputRef.current?.click()}
						className="hover:border-primary flex size-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-xs font-medium text-gray-500 transition-colors dark:border-gray-600 dark:text-gray-400"
					>
						<ImagePlus className="text-primary size-6" />
						{translate('review.addPhoto')}
					</button>
				)}
			</div>

			<input
				ref={inputRef}
				type="file"
				accept="image/png,image/jpeg,image/webp,image/avif"
				multiple
				hidden
				onChange={(event) => pick(event.target.files)}
			/>

			{error && <p className="text-xs text-red-500">{error}</p>}
		</div>
	);
}
