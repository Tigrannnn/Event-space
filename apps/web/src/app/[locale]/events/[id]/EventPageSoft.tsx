'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Check, Clock, Images, MapPin, Mountain, Share2, Star } from 'lucide-react';
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
import { localizePath } from '@/lib/i18n/config';
import { useModalStore } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';

interface EventPageSoftProps {
	initialEvent: Event;
}

const MAX_GALLERY_IMAGES = 3;

/**
 * The soft skin's tour page: the title and its chips first, then a framed photo mosaic, then the
 * text on white cards beside the booking card. The classic page opens on a full-width photo strip;
 * this one keeps everything inside the page margins.
 */
export default function EventPageSoft({ initialEvent }: EventPageSoftProps) {
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
	const hasIncluded = eventTranslation.whatsIncluded.length > 0;

	const openPreview = (index: number) =>
		openModal(ModalType.ImagePreview, { images: imageUrls, initialIndex: index });

	const handleShareClick = async () => {
		const url = typeof window !== 'undefined' ? window.location.href : '';
		await copyToClipboard(url, 'event.linkCopied', 'event.copyFailed');
	};

	const pill =
		'flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700';
	const card =
		'rounded-3xl border border-gray-200/70 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-700 dark:bg-gray-800';

	const facts = [
		{ Icon: Clock, label: translate('event.duration'), value: formatDuration(event.duration) },
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
		<div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
			<div className="mb-5 flex items-center justify-between gap-3">
				<button type="button" onClick={() => router.back()} className={pill}>
					<ArrowLeft className="size-4" />
					{translate('event.back')}
				</button>
				<div className="flex items-center gap-2">
					<button type="button" onClick={handleShareClick} className={pill}>
						<Share2 className="size-4" />
						<span className="hidden sm:inline">{translate('event.share')}</span>
					</button>
					<FavoriteButton eventId={event.id} />
				</div>
			</div>

			<div className="mb-6">
				{categoryTranslation?.name &&
					(event.category?.slug ? (
						<Link
							href={localizePath(`/category/${event.category.slug}`, locale)}
							className="bg-accent/10 text-accent hover:bg-accent/20 inline-block rounded-full px-4 py-1.5 text-sm font-bold transition-colors"
						>
							{categoryTranslation.name}
						</Link>
					) : (
						<span className="bg-accent/10 text-accent inline-block rounded-full px-4 py-1.5 text-sm font-bold">
							{categoryTranslation.name}
						</span>
					))}
				<h1 className="text-primary mt-3 text-3xl leading-tight font-bold sm:text-5xl">
					{eventTranslation.title}
				</h1>
				<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-700 dark:text-gray-300">
					<span className="flex items-center gap-1.5">
						<MapPin className="text-primary size-4" />
						{event.locationUrl ? (
							<a
								href={event.locationUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-primary underline underline-offset-4"
							>
								{eventTranslation.location}
							</a>
						) : (
							eventTranslation.location
						)}
					</span>
					{average !== null && (
						<span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
							<Star className="size-4 fill-current" />
							{average}
						</span>
					)}
				</div>
			</div>

			{allImagesFailed || imageUrls.length === 0 ? (
				<div className="aspect-16/7 overflow-hidden rounded-3xl">
					<EventImageFallback alt={eventTranslation.title} />
				</div>
			) : (
				<div className="relative">
					<div
						className={`grid h-64 gap-2 overflow-hidden rounded-3xl shadow-lg ring-4 ring-white sm:h-[26rem] dark:ring-gray-800 ${
							shown.length >= 3
								? 'grid-cols-1 sm:grid-cols-3 sm:grid-rows-2'
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
								className={`relative cursor-pointer overflow-hidden bg-gray-100 dark:bg-gray-900 ${
									index === 0 && shown.length >= 3 ? 'sm:col-span-2 sm:row-span-2' : ''
								} ${index > 0 ? 'hidden sm:block' : ''}`}
							>
								<EventImage
									src={src}
									alt={eventTranslation.title}
									onError={() => setFailedImages((count) => count + 1)}
									fallback={<EventImageFallback alt={eventTranslation.title} />}
									className="size-full object-cover transition-transform duration-500 hover:scale-105"
								/>
							</button>
						))}
					</div>
					{imageUrls.length > shown.length && (
						<button
							type="button"
							onClick={() => openPreview(0)}
							className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-gray-900 shadow-md transition-transform hover:scale-105"
						>
							<Images className="size-4" />
							{imageUrls.length}
						</button>
					)}
				</div>
			)}

			<div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						{facts.map(({ Icon, label, value }) => (
							<div
								key={label}
								className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800"
							>
								<span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-full">
									<Icon className="size-5" />
								</span>
								<div className="min-w-0">
									<p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
									<p className="truncate text-sm font-bold text-gray-900 dark:text-white">{value}</p>
								</div>
							</div>
						))}
					</div>

					<section className={card}>
						<h2 className="text-primary mb-3 text-2xl font-bold">{translate('event.aboutTour')}</h2>
						<p className="leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
							{eventTranslation.description}
						</p>
					</section>

					{hasIncluded && (
						<section className={card}>
							<h2 className="text-primary mb-4 text-2xl font-bold">{translate('event.whatsIncluded')}</h2>
							<ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								{eventTranslation.whatsIncluded.map((item: string, index: number) => (
									<li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
										<span className="bg-accent/15 text-accent mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
											<Check className="size-3.5" strokeWidth={3} />
										</span>
										{item}
									</li>
								))}
							</ul>
						</section>
					)}

					<section className={`${card} empty:hidden`}>
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
