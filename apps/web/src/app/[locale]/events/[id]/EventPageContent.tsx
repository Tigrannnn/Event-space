'use client';

import { useRouter } from 'next/navigation';
import { Key, useState } from 'react';
import Button from '@/components/ui/Buttons/Button';
import { useModalStore } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';
import { ArrowLeft, Share2, MapPin, Clock, Mountain, Users } from 'lucide-react';
import { EventImage, useEventById } from '@/features/events';
import { InfoCard } from '@/components/ui/InfoCard';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';

import { ToastType, useToastStore } from '@/stores/toastStore';
import {
	Event,
	getEventImageUrls,
	getEventTranslation,
	getCategoryTranslation,
} from '@event-space/shared';
import { EventImageFallback } from '@/features/events';
import { IncludedItem } from '@/components/ui/IncludedItem';
import BookingSidebar from '@/features/bookings/components/BookingSidebar';
import { useTranslation } from '@/hooks/translation';

interface EventPageContentProps {
	initialEvent: Event;
}

export default function EventPageContent({ initialEvent }: EventPageContentProps) {
	const { data } = useEventById(initialEvent.id, { initialData: initialEvent });
	const event = data ?? initialEvent;
	const router = useRouter();
	const { openModal } = useModalStore();
	const [failedImages, setFailedImages] = useState<number>(0);
	const { addToast } = useToastStore();
	const translate = useTranslation();
	const locale = translate.locale;

	const eventTranslation = getEventTranslation(event, locale);
	const categoryTranslation = getCategoryTranslation(event.category, locale);

	const handleImageError = () => {
		setFailedImages((prev) => prev + 1);
	};

	const imageUrls = getEventImageUrls(event.images);
	const allImagesFailed = imageUrls.length > 0 && failedImages >= imageUrls.length;

	const handleShareClick = async () => {
		const url = typeof window !== 'undefined' ? window.location.href : '';
		try {
			await navigator.clipboard.writeText(url);
			addToast(translate('event.linkCopied'), ToastType.SUCCESS);
		} catch (error) {
			// The browser's own failure text is untranslated, so it stays in the console.
			console.error('Failed to copy the event link', error);
			addToast(translate('event.copyFailed'), ToastType.ERROR);
		}
	};

	return (
		<div className="min-h-full">
			{/* Hero Section */}
			<section className="relative flex min-h-45 w-full items-center overflow-hidden sm:h-[40vh] lg:h-[50vh]">
				{/* Image Gallery */}
				{allImagesFailed ? (
					<EventImageFallback alt={eventTranslation.title} />
				) : (
					<div className="scrollbar-hide h-full w-full snap-x snap-mandatory overflow-x-auto">
						<div className="flex h-full items-center">
							{imageUrls.map((imgSrc, index) => (
								<button
									key={`${imgSrc}-${index}`}
									onClick={() =>
										openModal(ModalType.ImagePreview, {
											images: imageUrls,
											initialIndex: index,
										})
									}
									className="flex w-full shrink-0 snap-center items-center justify-center px-2 sm:h-full sm:w-auto sm:px-0"
								>
									<EventImage
										src={imgSrc}
										alt={eventTranslation.title}
										onError={handleImageError}
										className="h-auto max-h-[70vh] w-full scale-98 cursor-pointer rounded-2xl border border-gray-400 object-contain shadow-sm transition-transform duration-100 hover:scale-100 sm:h-full sm:w-auto"
									/>
								</button>
							))}
						</div>
					</div>
				)}

				{/* Sticky Controls */}
				<div className="pointer-events-none absolute inset-0">
					<div className="sticky right-0 left-0 flex items-start justify-between p-3 sm:p-4 md:p-6">
						<Button
							variant="secondary"
							onClick={() => router.back()}
							className="pointer-events-auto flex items-center gap-2 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm sm:px-4 sm:py-3"
						>
							<ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
							<span className="hidden md:inline">{translate('event.back')}</span>
						</Button>

						<div className="pointer-events-auto flex items-center gap-2">
							<Button
								variant="secondary"
								onClick={handleShareClick}
								className="flex items-center gap-2 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm sm:px-4 sm:py-3"
							>
								<Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
								<span className="hidden md:inline">{translate('event.share')}</span>
							</Button>
							<FavoriteButton eventId={event.id} />
						</div>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
				<div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-12">
					{/* Left Column - Event Details */}
					<div className="space-y-6 sm:space-y-8 lg:col-span-2">
						<div>
							<h1 className="text-primary mb-3 text-3xl leading-tight font-black sm:mb-4 sm:text-4xl md:text-5xl">
								{eventTranslation.title}
							</h1>

							<div className="mb-4 flex items-center gap-2 text-gray-700 sm:mb-6 dark:text-gray-300">
								<MapPin className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
								{event.locationUrl ? (
									<a
										href={event.locationUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-primary text-sm font-medium underline underline-offset-2 transition-colors sm:text-base"
									>
										{eventTranslation.location}
									</a>
								) : (
									<span className="text-sm font-medium sm:text-base">{eventTranslation.location}</span>
								)}
							</div>

							<span className="bg-primary/10 text-primary inline-block rounded-full px-4 py-2 text-[13px] font-bold tracking-wide uppercase sm:px-5 sm:py-2.5 sm:text-sm">
								{categoryTranslation?.name || ''}
							</span>
						</div>

						{/* Info Icons Grid */}
						<div className="grid grid-cols-3 gap-3 border-y border-gray-200 py-4 sm:gap-4 sm:py-6">
							<InfoCard
								icon={Clock}
								label={translate('event.duration')}
								value={`${Math.floor(event.duration / 60)} ${translate('event.hours')}`}
							/>
							{event.difficulty && (
								<InfoCard icon={Mountain} label={translate('event.difficulty')} value={event.difficulty} />
							)}
						</div>

						{/* Description */}
						<div>
							<h2 className="text-primary mb-3 text-xl font-black sm:mb-4 sm:text-2xl">
								{translate('event.aboutTour')}
							</h2>
							<div className="prose prose-base sm:prose-lg max-w-none leading-relaxed text-gray-600">
								<p>{eventTranslation.description}</p>
							</div>
						</div>

						{/* What's Included */}
						<div>
							<h2 className="text-primary mb-3 text-xl font-black sm:mb-4 sm:text-2xl">
								{translate('event.whatsIncluded')}
							</h2>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
								{eventTranslation.whatsIncluded.map((item: string, index: Key | null | undefined) => (
									<IncludedItem key={index} text={item} />
								))}
							</div>
						</div>
					</div>

					{/* Right Column - Booking Sidebar */}
					<div className="lg:col-span-1">
						<div className="sticky top-24">
							<BookingSidebar event={event} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
