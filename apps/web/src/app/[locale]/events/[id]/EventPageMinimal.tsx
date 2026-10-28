'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Check, Clock, Images, MapPin, Mountain, Share2 } from 'lucide-react';
import {
	getCategoryTranslation,
	getEventImageUrls,
	getEventTranslation,
	type Event,
} from '@event-space/shared';
import { EventImage, EventImageFallback, useEventById } from '@/features/events';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { EventReviews, WriteReviewButton } from '@/features/reviews';
import BookingSidebar from '@/features/bookings/components/BookingSidebar';
import { useCopyToClipboard } from '@/hooks/clipboard';
import { useFormatDate } from '@/hooks/format';
import { useLabels } from '@/hooks/labels/useLabels';
import { useTranslation } from '@/hooks/translation';
import { localizePath } from '@/lib/i18n/config';
import { useModalStore } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';

interface EventPageMinimalProps {
	initialEvent: Event;
}

const MAX_GALLERY_IMAGES = 5;

/**
 * The minimal skin's tour page: a photo grid on top, a plain heading, and the booking card
 * beside the text. Sections are told apart by hairlines rather than by boxes.
 */
export default function EventPageMinimal({ initialEvent }: EventPageMinimalProps) {
	const { data } = useEventById(initialEvent.id, { initialData: initialEvent });
	const event = data ?? initialEvent;
	const router = useRouter();
	const { openModal } = useModalStore();
	const copyToClipboard = useCopyToClipboard();
	const translate = useTranslation();
	const locale = translate.locale;
	const { formatDuration } = useFormatDate();
	const { EVENT_DIFFICULTY_LABELS } = useLabels();
	const [failedImages, setFailedImages] = useState(0);

	const eventTranslation = getEventTranslation(event, locale);
	const categoryTranslation = getCategoryTranslation(event.category, locale);
	const imageUrls = getEventImageUrls(event.images);
	const allImagesFailed = imageUrls.length > 0 && failedImages >= imageUrls.length;
	const shown = imageUrls.slice(0, MAX_GALLERY_IMAGES);

	const openPreview = (index: number) =>
		openModal(ModalType.ImagePreview, { images: imageUrls, initialIndex: index });

	const handleShareClick = async () => {
		const url = typeof window !== 'undefined' ? window.location.href : '';
		await copyToClipboard(url, 'event.linkCopied', 'event.copyFailed');
	};

	const textButton =
		'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-gray-800 underline-offset-4 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-neutral-800';
	const hairline = 'border-t border-gray-200 pt-8 dark:border-neutral-800';

	return (
		<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div className="mb-4 flex items-center justify-between">
				<button type="button" onClick={() => router.back()} className={`${textButton} -ml-3`}>
					<ArrowLeft className="size-4" />
					{translate('event.back')}
				</button>
				<div className="flex items-center gap-1">
					<button type="button" onClick={handleShareClick} className={textButton}>
						<Share2 className="size-4" />
						<span className="underline">{translate('event.share')}</span>
					</button>
					<FavoriteButton eventId={event.id} variant="plain" />
				</div>
			</div>

			<h1 className="mb-2 text-3xl leading-tight font-semibold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
				{eventTranslation.title}
			</h1>
			<div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-600 dark:text-gray-300">
				<span className="flex items-center gap-1.5">
					<MapPin className="size-4" />
					{event.locationUrl ? (
						<a
							href={event.locationUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="underline underline-offset-4"
						>
							{eventTranslation.location}
						</a>
					) : (
						eventTranslation.location
					)}
				</span>
				{categoryTranslation?.name && (
					<>
						<span aria-hidden>·</span>
						{event.category?.slug ? (
							<Link
								href={localizePath(`/category/${event.category.slug}`, locale)}
								className="underline underline-offset-4"
							>
								{categoryTranslation.name}
							</Link>
						) : (
							<span>{categoryTranslation.name}</span>
						)}
					</>
				)}
			</div>

			{allImagesFailed || imageUrls.length === 0 ? (
				<div className="aspect-16/7 overflow-hidden rounded-2xl">
					<EventImageFallback alt={eventTranslation.title} />
				</div>
			) : (
				<div className="relative">
					<div
						className={`grid h-64 gap-2 overflow-hidden rounded-2xl sm:h-[30rem] ${
							shown.length >= 3
								? 'grid-cols-1 sm:grid-cols-4 sm:grid-rows-2'
								: shown.length === 2
									? 'grid-cols-1 sm:grid-cols-2'
									: 'grid-cols-1'
						}`}
					>
						{shown.map((src, index) => (
							<button
								key={`${src}-${index}`}
								type="button"
								onClick={() => openPreview(index)}
								className={`relative cursor-pointer overflow-hidden bg-gray-100 dark:bg-neutral-900 ${
									index === 0 && shown.length >= 3 ? 'sm:col-span-2 sm:row-span-2' : ''
								} ${index > 0 ? 'hidden sm:block' : ''}`}
							>
								<EventImage
									src={src}
									alt={eventTranslation.title}
									onError={() => setFailedImages((count) => count + 1)}
									fallback={<EventImageFallback alt={eventTranslation.title} />}
									className="size-full object-cover transition-opacity hover:opacity-90"
								/>
							</button>
						))}
					</div>
					{imageUrls.length > 1 && (
						<button
							type="button"
							onClick={() => openPreview(0)}
							className="absolute right-3 bottom-3 flex items-center gap-2 rounded-lg border border-gray-900 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50"
						>
							<Images className="size-4" />
							{imageUrls.length}
						</button>
					)}
				</div>
			)}

			<div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-16">
				<div className="space-y-8 lg:col-span-2">
					<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-800 dark:text-gray-100">
						<span className="flex items-center gap-2">
							<Clock className="size-5 text-gray-500" />
							<span className="text-gray-500">{translate('event.duration')}:</span>
							<span className="font-medium">{formatDuration(event.duration)}</span>
						</span>
						{event.difficulty !== 'NONE' && (
							<span className="flex items-center gap-2">
								<Mountain className="size-5 text-gray-500" />
								<span className="text-gray-500">{translate('event.difficulty')}:</span>
								<span className="font-medium">{EVENT_DIFFICULTY_LABELS[event.difficulty]}</span>
							</span>
						)}
					</div>

					<section className={hairline}>
						<h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
							{translate('event.aboutTour')}
						</h2>
						<p className="leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
							{eventTranslation.description}
						</p>
					</section>

					{eventTranslation.whatsIncluded.length > 0 && (
						<section className={hairline}>
							<h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
								{translate('event.whatsIncluded')}
							</h2>
							<ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
								{eventTranslation.whatsIncluded.map((item: string, index: number) => (
									<li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
										<Check className="text-primary mt-0.5 size-5 shrink-0" />
										{item}
									</li>
								))}
							</ul>
						</section>
					)}

					<section className={hairline}>
						<EventReviews event={event} />
					</section>

					<WriteReviewButton eventId={event.id} />
				</div>

				<div className="lg:col-span-1">
					<div className="sticky top-[calc(var(--header-height,6rem)+1rem)]">
						<BookingSidebar event={event} />
					</div>
				</div>
			</div>
		</div>
	);
}
