'use client';

import type { ReviewImage } from '@event-space/shared';
import { useModalStore } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';
import { cn } from '@/utils/cn';

interface ReviewPhotosProps {
	images: ReviewImage[] | undefined;
	className?: string;
}

/** The photos under a review; pressing one opens the same full-size view as the tour's own. */
export function ReviewPhotos({ images, className }: ReviewPhotosProps) {
	const { openModal } = useModalStore();

	if (!images?.length) return null;

	const urls = images.map((image) => image.url);

	return (
		<div className={cn('mt-3 flex flex-wrap gap-2', className)}>
			{images.map((image, index) => (
				<button
					key={image.id}
					type="button"
					onClick={() => openModal(ModalType.ImagePreview, { images: urls, initialIndex: index })}
					className="size-20 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-gray-100 in-data-[skin=listing]:rounded-md sm:size-24 dark:bg-neutral-800"
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={image.url}
						alt=""
						loading="lazy"
						className="size-full object-cover transition-opacity hover:opacity-90"
					/>
				</button>
			))}
		</div>
	);
}
