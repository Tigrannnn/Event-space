'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
	ArrowLeft,
	Check,
	ChevronRight,
	Clock,
	Images,
	MapPin,
	Mountain,
	Share2,
} from 'lucide-react';
import {
	averageRating,
	getCategoryTranslation,
	getEventImageUrls,
	getEventTranslation,
	type Event,
} from '@event-space/shared';
import { EventImage, EventImageFallback, useEventById } from '@/features/events';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { EventReviews } from '@/features/reviews';
import BookingSidebar from '@/features/bookings/components/BookingSidebar';
import { useCopyToClipboard } from '@/hooks/clipboard';
import { useFormatDate } from '@/hooks/format';
import { useLabels } from '@/hooks/labels/useLabels';
import { useTranslation } from '@/hooks/translation';
import { localizePath } from '@/lib/i18n/config';
import { useModalStore } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';

interface EventPageListingProps {
	initialEvent: Event;
}

const MAX_GALLERY_IMAGES = 5;

/**
 * The listing skin's tour page: a trail of links over the title with its score, a mosaic of
 * photos, a row of key facts, then the text in boxes beside the booking card. The section bar
 * under the photos sticks to the header so a long page can be jumped through.
 */
export default function EventPageListing({ initialEvent }: EventPageListingProps) {
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
	const average = averageRating(event);
	const ratingCount = event.ratingCount ?? 0;
	const hasIncluded = eventTranslation.whatsIncluded.length > 0;

	const openPreview = (index: number) =>
		openModal(ModalType.ImagePreview, { images: imageUrls, initialIndex: index });

	const handleShareClick = async () => {
		const url = typeof window !== 'undefined' ? window.location.href : '';
		await copyToClipboard(url, 'event.linkCopied', 'event.copyFailed');
	};

	const iconButton =
		'flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100 dark:hover:bg-neutral-800';
	const box =
		'scroll-mt-40 rounded-lg border border-gray-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900';

	const sections = [
		{ id: 'about', label: translate('event.aboutTour') },
		...(hasIncluded ? [{ id: 'included', label: translate('event.whatsIncluded') }] : []),
		{ id: 'reviews', label: translate('review.sectionTitle') },
	];

	const facts = [
		{
			Icon: Clock,
			label: translate('event.duration'),
			value: formatDuration(event.duration),
		},
		...(event.difficulty !== 'NONE'
			? [
					{
						Icon: Mountain,
						label: translate('event.difficulty'),
						value: EVENT_DIFFICULTY_LABELS[event.difficulty],
					},
				]
			: []),
		{ Icon: MapPin, label: translate('event.location'), value: eventTranslation.location },
	];

	return (
		<div className="mx-auto max-w-[1200px] px-4 py-5 sm:px-6 lg:px-8">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<nav className="flex min-w-0 items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
					<Link
						href={localizePath('/', locale)}
						className="text-primary hover:underline dark:text-gray-200"
					>
						{translate('header.home')}
					</Link>
					{event.category?.slug && categoryTranslation?.name && (
						<>
							<ChevronRight className="size-4 shrink-0" />
							<Link
								href={localizePath(`/category/${event.category.slug}`, locale)}
								className="text-primary truncate hover:underline dark:text-gray-200"
							>
								{categoryTranslation.name}
							</Link>
						</>
					)}
				</nav>
				<div className="flex items-center gap-2">
					<button type="button" onClick={() => router.back()} className={iconButton}>
						<ArrowLeft className="size-4" />
						{translate('event.back')}
					</button>
					<button type="button" onClick={handleShareClick} className={iconButton}>
						<Share2 className="size-4" />
						{translate('event.share')}
					</button>
					<FavoriteButton eventId={event.id} variant="plain" />
				</div>
			</div>

			<div className="mb-4 flex items-start justify-between gap-4">
				<div className="min-w-0">
					<h1 className="text-2xl leading-tight font-bold text-gray-900 sm:text-3xl dark:text-white">
						{eventTranslation.title}
					</h1>
					<p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
						<MapPin className="text-primary size-4 shrink-0" />
						{event.locationUrl ? (
							<a
								href={event.locationUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline dark:text-gray-200"
							>
								{eventTranslation.location}
							</a>
						) : (
							eventTranslation.location
						)}
					</p>
				</div>
				{average !== null && (
					<div className="flex shrink-0 items-center gap-2">
						{ratingCount > 0 && (
							<span className="hidden text-sm text-gray-600 sm:block dark:text-gray-400">
								{translate('event.reviewsCount', { count: ratingCount })}
							</span>
						)}
						<span className="bg-primary rounded-md rounded-bl-none px-2.5 py-1.5 text-base font-bold text-white">
							{average}
						</span>
					</div>
				)}
			</div>

			{allImagesFailed || imageUrls.length === 0 ? (
				<div className="aspect-16/7 overflow-hidden rounded-lg">
					<EventImageFallback alt={eventTranslation.title} />
				</div>
			) : (
				<div className="relative">
					<div
						className={`grid h-64 gap-1.5 overflow-hidden rounded-lg sm:h-[26rem] ${
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
									index === 0 && shown.length >= 3
										? 'sm:col-span-2 sm:row-span-2'
										: index === 1 && shown.length >= 3
											? 'sm:col-span-2'
											: ''
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
							className="bg-primary absolute right-3 bottom-3 flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:brightness-90"
						>
							<Images className="size-4" />
							{imageUrls.length}
						</button>
					)}
				</div>
			)}

			<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="space-y-5 lg:col-span-2">
					<div className="grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
						{facts.map(({ Icon, label, value }) => (
							<div key={label} className="flex items-center gap-3 p-4">
								<span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-md">
									<Icon className="size-5" />
								</span>
								<div className="min-w-0">
									<p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
									<p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
								</div>
							</div>
						))}
					</div>

					<div className="sticky top-(--header-height,6rem) z-20 -mx-4 overflow-x-auto border-b border-gray-200 bg-white px-4 sm:mx-0 sm:rounded-lg sm:border dark:border-neutral-800 dark:bg-neutral-900">
						<div className="flex gap-6">
							{sections.map((section) => (
								<a
									key={section.id}
									href={`#${section.id}`}
									className="hover:border-primary hover:text-primary -mb-px shrink-0 border-b-2 border-transparent py-3 text-sm font-semibold text-gray-700 transition-colors dark:text-gray-200"
								>
									{section.label}
								</a>
							))}
						</div>
					</div>

					<section id="about" className={box}>
						<h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
							{translate('event.aboutTour')}
						</h2>
						<p className="leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
							{eventTranslation.description}
						</p>
					</section>

					{hasIncluded && (
						<section id="included" className={box}>
							<h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
								{translate('event.whatsIncluded')}
							</h2>
							<ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
								{eventTranslation.whatsIncluded.map((item: string, index: number) => (
									<li key={index} className="flex items-start gap-2.5 text-gray-700 dark:text-gray-300">
										<Check className="mt-0.5 size-5 shrink-0 text-emerald-600" />
										{item}
									</li>
								))}
							</ul>
						</section>
					)}

					<section id="reviews" className={`${box} empty:hidden`}>
						<EventReviews event={event} />
					</section>
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
