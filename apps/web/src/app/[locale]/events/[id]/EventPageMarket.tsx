'use client';

import Link from 'next/link';
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
import { useShare } from '@/hooks/share';
import { useFormatDate } from '@/hooks/format';
import { useLabels } from '@/hooks/labels/useLabels';
import { useTranslation } from '@/hooks/translation';
import { localizePath } from '@/lib/i18n/config';
import { useModalStore } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';

interface EventPageMarketProps {
	initialEvent: Event;
}

const MAX_THUMBNAILS = 6;

/**
 * The market skin's tour page, laid out like a product page on a marketplace: the title and one
 * big photo with a strip of thumbnails, facts and text in bordered cards, and the booking card
 * pinned beside them.
 */
export default function EventPageMarket({ initialEvent }: EventPageMarketProps) {
	const { data } = useEventById(initialEvent.id, { initialData: initialEvent });
	const event = data ?? initialEvent;
	const router = useRouter();
	const { openModal } = useModalStore();
	const share = useShare();
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

	const handleShareClick = () => share(eventTranslation.title);

	const average = averageRating(event);
	const ratingCount = event.ratingCount ?? 0;

	const textButton =
		'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-800';
	const card =
		'rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900';

	return (
		<div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
			<div className="mb-3 flex items-center justify-between">
				<button type="button" onClick={() => router.back()} className={`${textButton} -ml-3`}>
					<ArrowLeft className="size-4" />
					{translate('event.back')}
				</button>
				<div className="flex items-center gap-1">
					<button type="button" onClick={handleShareClick} className={textButton}>
						<Share2 className="size-4" />
						{translate('event.share')}
					</button>
					<FavoriteButton eventId={event.id} variant="plain" />
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
				<div className="min-w-0 space-y-4">
					<div>
						<h1 className="text-2xl leading-tight font-bold text-gray-900 sm:text-3xl dark:text-white">
							{eventTranslation.title}
						</h1>
						<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
							{average !== null && (
								<span className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
									<Star className="size-4 fill-amber-400 text-amber-400" />
									{average}
									{ratingCount > 0 && <span className="font-normal text-gray-400">({ratingCount})</span>}
								</span>
							)}
							<span className="flex items-center gap-1.5">
								<MapPin className="text-primary size-4" />
								{event.locationUrl ? (
									<a
										href={event.locationUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-primary underline-offset-4 hover:underline"
									>
										{eventTranslation.location}
									</a>
								) : (
									eventTranslation.location
								)}
							</span>
							{categoryTranslation?.name &&
								(event.category?.slug ? (
									<Link
										href={localizePath(`/category/${event.category.slug}`, locale)}
										className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-semibold"
									>
										{categoryTranslation.name}
									</Link>
								) : (
									<span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-semibold">
										{categoryTranslation.name}
									</span>
								))}
						</div>
					</div>

					{allImagesFailed || imageUrls.length === 0 ? (
						<div className="aspect-16/9 overflow-hidden rounded-2xl">
							<EventImageFallback alt={eventTranslation.title} />
						</div>
					) : (
						<div className="space-y-2">
							<button
								type="button"
								onClick={() => openPreview(activeImage)}
								className="relative block aspect-4/3 max-h-[34rem] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-gray-100 sm:aspect-16/10 dark:bg-neutral-900"
							>
								<EventImage
									src={imageUrls[activeImage] ?? imageUrls[0]}
									alt={eventTranslation.title}
									onError={() => setFailedImages((count) => count + 1)}
									fallback={<EventImageFallback alt={eventTranslation.title} />}
									className="size-full object-cover"
								/>
							</button>
							{thumbnails.length > 1 && (
								<div className="flex [scrollbar-width:none] gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
									{thumbnails.map((src, index) => (
										<button
											key={`${src}-${index}`}
											type="button"
											onClick={() => setActiveImage(index)}
											aria-label={`${index + 1} / ${thumbnails.length}`}
											className={`relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 sm:size-20 ${
												index === activeImage
													? 'border-primary'
													: 'border-transparent opacity-80 hover:opacity-100'
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
						</div>
					)}

					<div className={`${card} flex flex-wrap items-center gap-x-8 gap-y-3`}>
						<span className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
							<Clock className="text-primary size-5" />
							<span className="text-gray-500">{translate('event.duration')}:</span>
							<span className="font-semibold">{formatDuration(event.duration)}</span>
						</span>
						{event.difficulty !== 'NONE' && (
							<span className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
								<Mountain className="text-primary size-5" />
								<span className="text-gray-500">{translate('event.difficulty')}:</span>
								<span className="font-semibold">{EVENT_DIFFICULTY_LABELS[event.difficulty]}</span>
							</span>
						)}
					</div>

					<section className={card}>
						<h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
							{translate('event.aboutTour')}
						</h2>
						<p className="leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
							{eventTranslation.description}
						</p>
					</section>

					{eventTranslation.whatsIncluded.length > 0 && (
						<section className={card}>
							<h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
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

					<section className={card}>
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
