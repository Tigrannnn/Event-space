'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/Buttons/Button';
import { useModalStore } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';
import { ArrowLeft, Share2, MapPin, Clock, Mountain, Users } from 'lucide-react';
import { EventImage, useEventById } from '@/features/events';
import { InfoCard } from '@/components/ui/InfoCard';

import { ToastType, useToastStore } from '@/stores/toastStore';
import { Event } from '@event-space/shared';
import { EventImageFallback } from '@/features/events';
import { IncludedItem } from '@/components/ui/IncludedItem';
import BookingSidebar from '@/features/bookings/components/BookingSidebar';

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

	const handleImageError = () => {
		setFailedImages((prev) => prev + 1);
	};

	const allImagesFailed = event && event.images.length > 0 && failedImages >= event.images.length;

	const handleShareClick = async () => {
		const url = typeof window !== 'undefined' ? window.location.href : '';
		try {
			await navigator.clipboard.writeText(url);
			addToast('Link copied to clipboard!', ToastType.SUCCESS);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to copy link';
			addToast(errorMessage, ToastType.ERROR);
		}
	};

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="relative flex min-h-45 w-full items-center overflow-hidden sm:h-[40vh] lg:h-[50vh]">
				{/* Image Gallery */}
				{allImagesFailed ? (
					<EventImageFallback alt={event.title} />
				) : (
					<div className="scrollbar-hide h-full w-full snap-x snap-mandatory overflow-x-auto">
						<div className="flex h-full items-center">
							{event.images.map((imgSrc, index) => (
								<button
									key={imgSrc}
									onClick={() =>
										openModal(ModalType.ImagePreview, {
											images: event.images,
											initialIndex: index,
										})
									}
									className="flex w-full shrink-0 snap-center items-center justify-center px-2 sm:h-full sm:w-auto sm:px-0"
								>
									<EventImage
										src={imgSrc}
										alt={event.title}
										onError={handleImageError}
										className="h-auto max-h-[70vh] w-full scale-98 cursor-pointer rounded-2xl border border-gray-400 object-contain shadow-sm transition-transform duration-100 hover:scale-100 active:scale-98 sm:h-full sm:w-auto"
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
							<span className="hidden md:inline">Back</span>
						</Button>

						<Button
							variant="secondary"
							onClick={handleShareClick}
							className="pointer-events-auto flex items-center gap-2 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm sm:px-4 sm:py-3"
						>
							<Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
							<span className="hidden md:inline">Share</span>
						</Button>
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
								{event.title}
							</h1>

							<div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4 md:gap-6">
								<div className="flex items-center gap-2 text-gray-600">
									<MapPin className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
									<span className="text-sm font-medium sm:text-base">{event.location}</span>
								</div>
							</div>

							<span className="bg-primary/10 text-primary inline-block rounded-full px-4 py-2 text-[13px] font-bold tracking-wide uppercase sm:px-5 sm:py-2.5 sm:text-sm">
								{event.category}
							</span>
						</div>

						{/* Info Icons Grid */}
						<div className="grid grid-cols-3 gap-3 border-y border-gray-200 py-4 sm:gap-4 sm:py-6">
							<InfoCard icon={Clock} label="Duration" value={`${Math.floor(event.duration / 60)} hours`} />
							<InfoCard icon={Mountain} label="Difficulty" value={event.difficulty} />
							<InfoCard icon={Users} label="Max People" value={String(event.maxParticipants)} />
						</div>

						{/* Description */}
						<div>
							<h2 className="text-primary mb-3 text-xl font-black sm:mb-4 sm:text-2xl">
								About this adventure
							</h2>
							<div className="prose prose-base sm:prose-lg max-w-none leading-relaxed text-gray-600">
								<p>{event.description}</p>
							</div>
						</div>

						{/* What's Included */}
						<div>
							<h2 className="text-primary mb-3 text-xl font-black sm:mb-4 sm:text-2xl">
								What&apos;s included
							</h2>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
								{event.whatsIncluded.map((item, index) => (
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
