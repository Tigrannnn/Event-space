'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
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
import { useShare } from '@/hooks/share';
import { useGallerySlides } from '@/features/events/components/GalleryVideo';
import { useFormatDate } from '@/hooks/format';
import { useLabels } from '@/hooks/labels/useLabels';
import { useTranslation } from '@/hooks/translation';
import { localizePath } from '@/lib/i18n/config';
import { useModalStore } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';
import { cn } from '@/utils/cn';

interface EventPageCapsuleProps {
	initialEvent: Event;
}

function SectionTitle({ children }: { children: ReactNode }) {
	return (
		<h2 className="text-primary mb-4 flex items-center gap-3 text-xl font-extrabold sm:text-2xl">
			<span className="text-sm text-(--brand-accent)">✦</span>
			{children}
		</h2>
	);
}

export default function EventPageCapsule({ initialEvent }: EventPageCapsuleProps) {
	const { data } = useEventById(initialEvent.id, { initialData: initialEvent });
	const event = data ?? initialEvent;
	const router = useRouter();
	const { openModal } = useModalStore();
	const share = useShare();
	const translate = useTranslation();
	const locale = translate.locale;
	const { formatDuration } = useFormatDate();
	const { EVENT_DIFFICULTY_LABELS } = useLabels();

	const eventTranslation = getEventTranslation(event, locale);
	const categoryTranslation = getCategoryTranslation(event.category, locale);
	const imageUrls = getEventImageUrls(event.images);
	const { slides } = useGallerySlides(event.videoUrl, imageUrls);
	const [failed, setFailed] = useState<string[]>([]);
	const photos = imageUrls.filter((src) => !failed.includes(src));

	const pills =
		photos.length >= 3
			? photos.slice(0, 3).map((src) => ({ src, position: 'object-center' }))
			: photos.length > 0
				? (['object-left', 'object-center', 'object-right'] as const).map((position) => ({
						src: photos[0],
						position,
					}))
				: [];

	const openPreview = (src?: string) =>
		openModal(ModalType.ImagePreview, {
			images: slides,
			videoUrl: event.videoUrl,
			initialIndex: src ? Math.max(0, slides.indexOf(src)) : 0,
		});

	const average = averageRating(event);
	const ratingCount = event.ratingCount ?? 0;

	const roundButton =
		'text-primary flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-gray-200';
	const fact =
		'text-primary flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold';
	const card = 'rounded-[2rem] bg-gray-50 p-6 sm:p-8';

	return (
		<div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
			<div className="mb-6 flex items-center justify-between">
				<button type="button" onClick={() => router.back()} className={roundButton}>
					<ArrowLeft className="size-4" />
					{translate('event.back')}
				</button>
				<div className="flex items-center gap-2">
					<button type="button" onClick={() => share(eventTranslation.title)} className={roundButton}>
						<Share2 className="size-4" />
						<span className="hidden sm:inline">{translate('event.share')}</span>
					</button>
					<FavoriteButton eventId={event.id} variant="plain" />
				</div>
			</div>

			<div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
				<div className="min-w-0">
					{categoryTranslation?.name &&
						(event.category?.slug ? (
							<Link
								href={localizePath(`/category/${event.category.slug}`, locale)}
								className="bg-primary/10 text-primary mb-4 inline-flex rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase"
							>
								{categoryTranslation.name}
							</Link>
						) : (
							<span className="bg-primary/10 text-primary mb-4 inline-flex rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
								{categoryTranslation.name}
							</span>
						))}
					<h1 className="text-primary text-3xl leading-[1.08] font-black tracking-tight break-words sm:text-5xl">
						{eventTranslation.title}
					</h1>
					<div className="mt-6 flex flex-wrap gap-2">
						{average !== null && (
							<span className={fact}>
								<Star className="size-4 fill-amber-400 text-amber-400" />
								{average}
								{ratingCount > 0 && <span className="font-medium text-gray-400">({ratingCount})</span>}
							</span>
						)}
						<span className={fact}>
							<MapPin className="size-4 text-(--brand-accent)" />
							{event.locationUrl ? (
								<a
									href={event.locationUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="underline-offset-4 hover:underline"
								>
									{eventTranslation.location}
								</a>
							) : (
								eventTranslation.location
							)}
						</span>
						<span className={fact}>
							<Clock className="size-4 text-(--brand-accent)" />
							{formatDuration(event.duration)}
						</span>
						{event.difficulty !== 'NONE' && (
							<span className={fact}>
								<Mountain className="size-4 text-(--brand-accent)" />
								{EVENT_DIFFICULTY_LABELS[event.difficulty]}
							</span>
						)}
					</div>
				</div>

				<div className="relative">
					{pills.length === 0 ? (
						<div className="aspect-4/3 overflow-hidden rounded-[2.5rem]">
							<EventImageFallback alt={eventTranslation.title} />
						</div>
					) : (
						<div className="grid h-80 grid-cols-3 gap-2 sm:h-[28rem] sm:gap-4">
							{pills.map((pill, index) => (
								<button
									key={`${pill.src}-${index}`}
									type="button"
									onClick={() => openPreview(pill.src)}
									aria-label={`${index + 1} / ${pills.length}`}
									className={cn(
										'relative cursor-zoom-in overflow-hidden rounded-full bg-gray-100',
										index === 1 ? 'h-[72%] self-start' : 'h-full',
									)}
								>
									<EventImage
										src={pill.src}
										alt={index === 0 ? eventTranslation.title : ''}
										onError={() =>
											setFailed((list) => (list.includes(pill.src) ? list : [...list, pill.src]))
										}
										fallback={<EventImageFallback alt="" />}
										className={`size-full object-cover transition-transform duration-700 hover:scale-105 ${pill.position}`}
									/>
								</button>
							))}
						</div>
					)}
					{pills.length > 0 && slides.length > 1 && (
						<button
							type="button"
							onClick={() => openPreview()}
							className="bg-primary absolute bottom-0 left-[calc(33.333%+0.25rem)] flex w-[calc(33.333%-0.5rem)] flex-col items-center justify-center gap-1 rounded-full py-4 text-sm font-bold text-white transition-all hover:brightness-125 sm:left-[calc(33.333%+0.5rem)] sm:w-[calc(33.333%-1rem)] sm:py-6"
						>
							<Images className="size-5" />
							{slides.length}
						</button>
					)}
				</div>
			</div>

			<div className="mt-10 grid grid-cols-1 gap-6 sm:mt-14 lg:grid-cols-[minmax(0,1fr)_24rem] lg:grid-rows-[auto_1fr] xl:grid-cols-[minmax(0,1fr)_26rem]">
				<div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
					<section className={card}>
						<SectionTitle>{translate('event.aboutTour')}</SectionTitle>
						<p className="leading-relaxed font-medium whitespace-pre-line text-gray-700">
							{eventTranslation.description}
						</p>
					</section>

					{eventTranslation.whatsIncluded.length > 0 && (
						<section className={card}>
							<SectionTitle>{translate('event.whatsIncluded')}</SectionTitle>
							<ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
								{eventTranslation.whatsIncluded.map((item: string, index: number) => (
									<li key={index} className="flex items-start gap-3 font-medium text-gray-700">
										<span className="bg-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white">
											<Check className="size-3" strokeWidth={3} />
										</span>
										{item}
									</li>
								))}
							</ul>
						</section>
					)}
				</div>

				<div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
					<div className="sticky top-[calc(var(--header-height,6rem)+1rem)]">
						<BookingSidebar event={event} />
					</div>
				</div>

				<div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-2">
					<section className={`${card} empty:hidden`}>
						<EventReviews event={event} />
					</section>
					<WriteReviewButton eventId={event.id} />
				</div>
			</div>
		</div>
	);
}
