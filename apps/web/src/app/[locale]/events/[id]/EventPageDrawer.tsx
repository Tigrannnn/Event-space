'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Check, Clock, MapPin, Mountain, Share2, Star } from 'lucide-react';
import {
	averageRating,
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
import { useModalStore } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';

interface EventPageDrawerProps {
	initialEvent: Event;
}

const MAX_THUMBNAILS = 6;

/**
 * The market skin's tour page, laid out like a product page on a marketplace: the title and one
 * big photo with a strip of thumbnails, facts and text in bordered cards, and the booking card
 * pinned beside them.
 */
export default function EventPageDrawer({ initialEvent }: EventPageDrawerProps) {
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
	const thumbnails = imageUrls.slice(0, MAX_THUMBNAILS);
	const [activeImage, setActiveImage] = useState(0);

	const openPreview = (index: number) =>
		openModal(ModalType.ImagePreview, { images: imageUrls, initialIndex: index });

	const handleShareClick = async () => {
		const url = typeof window !== 'undefined' ? window.location.href : '';
		await copyToClipboard(url, 'event.linkCopied', 'event.copyFailed');
	};

	const average = averageRating(event);
	const ratingCount = event.ratingCount ?? 0;

	const hasImages = !(allImagesFailed || imageUrls.length === 0);
	const frosted =
		'flex h-11 items-center gap-2 rounded-full bg-black/35 px-4 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/55';

	return (
		<div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
			<div className="relative isolate aspect-4/5 max-h-[38rem] w-full overflow-hidden rounded-[2rem] bg-gray-200 sm:aspect-21/9 sm:rounded-[2.5rem] dark:bg-neutral-800">
				<div className="absolute inset-0 -z-10">
					{hasImages ? (
						<button
							type="button"
							onClick={() => openPreview(activeImage)}
							className="block size-full cursor-zoom-in"
							aria-label={eventTranslation.title}
						>
							<EventImage
								src={imageUrls[activeImage] ?? imageUrls[0]}
								alt={eventTranslation.title}
								onError={() => setFailedImages((count) => count + 1)}
								fallback={<EventImageFallback alt={eventTranslation.title} />}
								className="size-full object-cover"
							/>
						</button>
					) : (
						<EventImageFallback alt={eventTranslation.title} />
					)}
				</div>
				<div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-black/80 via-black/15 to-black/20" />

				<div className="absolute top-4 right-4 left-4 flex items-center justify-between sm:top-6 sm:right-6 sm:left-6">
					<button type="button" onClick={() => router.back()} className={frosted}>
						<ArrowLeft className="size-4" />
						{translate('event.back')}
					</button>
					<div className="flex items-center gap-2">
						<button type="button" onClick={handleShareClick} className={frosted}>
							<Share2 className="size-4" />
							<span className="hidden sm:inline">{translate('event.share')}</span>
						</button>
						<FavoriteButton eventId={event.id} />
					</div>
				</div>

				<div className="pointer-events-none absolute right-5 bottom-5 left-5 text-white sm:right-10 sm:bottom-9 sm:left-10">
					{categoryTranslation?.name && (
						<span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
							{categoryTranslation.name}
						</span>
					)}
					<h1 className="max-w-3xl text-3xl leading-[1.05] font-black tracking-tight sm:text-5xl">
						{eventTranslation.title}
					</h1>
					<div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/90">
						{average !== null && (
							<span className="flex items-center gap-1 font-semibold">
								<Star className="size-4 fill-amber-400 text-amber-400" />
								{average}
								{ratingCount > 0 && <span className="font-normal text-white/70">({ratingCount})</span>}
							</span>
						)}
						<span className="flex items-center gap-1.5">
							<MapPin className="size-4" />
							{event.locationUrl ? (
								<a
									href={event.locationUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="pointer-events-auto underline-offset-4 hover:underline"
								>
									{eventTranslation.location}
								</a>
							) : (
								eventTranslation.location
							)}
						</span>
					</div>
				</div>
			</div>

			{hasImages && thumbnails.length > 1 && (
				<div className="mt-3 flex [scrollbar-width:none] gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
					{thumbnails.map((src, index) => (
						<button
							key={`${src}-${index}`}
							type="button"
							onClick={() => setActiveImage(index)}
							aria-label={`${index + 1} / ${thumbnails.length}`}
							className={`relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 sm:size-20 ${
								index === activeImage ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
							}`}
						>
							<EventImage
								src={src}
								alt=""
								fallback={<EventImageFallback alt="" />}
								className="size-full object-cover"
							/>
						</button>
					))}
				</div>
			)}

			<div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
				<div className="min-w-0 space-y-8">
					<div className="flex flex-wrap gap-3">
						<span className="bg-primary/10 flex items-center gap-2 rounded-full px-4 py-2.5 text-gray-800 dark:text-gray-100">
							<Clock className="text-primary size-5" />
							<span className="text-gray-500">{translate('event.duration')}:</span>
							<span className="font-semibold">{formatDuration(event.duration)}</span>
						</span>
						{event.difficulty !== 'NONE' && (
							<span className="bg-primary/10 flex items-center gap-2 rounded-full px-4 py-2.5 text-gray-800 dark:text-gray-100">
								<Mountain className="text-primary size-5" />
								<span className="text-gray-500">{translate('event.difficulty')}:</span>
								<span className="font-semibold">{EVENT_DIFFICULTY_LABELS[event.difficulty]}</span>
							</span>
						)}
					</div>

					<section>
						<h2 className="mb-4 text-2xl font-black tracking-tight text-gray-900 dark:text-white">
							{translate('event.aboutTour')}
						</h2>
						<p className="leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
							{eventTranslation.description}
						</p>
					</section>

					{eventTranslation.whatsIncluded.length > 0 && (
						<section>
							<h2 className="mb-5 text-2xl font-black tracking-tight text-gray-900 dark:text-white">
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

					<section>
						<EventReviews event={event} />
					</section>

					<WriteReviewButton eventId={event.id} />
				</div>

				<div>
					<div className="sticky top-[calc(var(--header-height,6rem)+1rem)]">
						<BookingSidebar event={event} />
					</div>
				</div>
			</div>
		</div>
	);
}
