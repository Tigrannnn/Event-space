'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { cn } from '@/utils/cn';
import BannerSlide from './BannerSlide';

interface BannerCarouselProps {
	banners: Banner[];
}

const AUTOPLAY_MS = 7000;

export default function BannerCarousel({ banners }: BannerCarouselProps) {
	const translate = useTranslation();
	const scrollerRef = useRef<HTMLDivElement>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);

	const scrollToIndex = useCallback((index: number) => {
		const scroller = scrollerRef.current;
		if (!scroller) return;

		scroller.scrollTo({ left: scroller.clientWidth * index, behavior: 'smooth' });
	}, []);

	const updateActiveIndex = useCallback(() => {
		const scroller = scrollerRef.current;
		if (!scroller || scroller.clientWidth === 0) return;

		setActiveIndex(Math.round(scroller.scrollLeft / scroller.clientWidth));
	}, []);

	useEffect(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return;

		scroller.addEventListener('scroll', updateActiveIndex, { passive: true });
		return () => scroller.removeEventListener('scroll', updateActiveIndex);
	}, [updateActiveIndex]);

	useEffect(() => {
		if (banners.length < 2 || isPaused) return;

		// Someone who asked the system for less motion gets the slides, but not the movement.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		// A timeout rather than an interval: it restarts whenever the slide changes, so a slide
		// the visitor just swiped to gets its full time instead of the remainder of a tick.
		const timer = window.setTimeout(() => {
			scrollToIndex((activeIndex + 1) % banners.length);
		}, AUTOPLAY_MS);

		return () => window.clearTimeout(timer);
	}, [activeIndex, banners.length, isPaused, scrollToIndex]);

	if (banners.length === 0) {
		return null;
	}

	const goTo = (index: number) => {
		const next = (index + banners.length) % banners.length;
		setActiveIndex(next);
		scrollToIndex(next);
	};

	return (
		<section
			aria-roledescription="carousel"
			aria-label={translate('common.bannersLabel')}
			className="relative py-4 sm:py-6"
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			onFocusCapture={() => setIsPaused(true)}
			onBlurCapture={() => setIsPaused(false)}
		>
			<div
				ref={scrollerRef}
				className="flex aspect-16/9 snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-2xl [scrollbar-width:none] sm:aspect-16/5 sm:rounded-3xl [&::-webkit-scrollbar]:hidden"
			>
				{banners.map((banner, index) => (
					<div
						key={banner.id}
						className="w-full shrink-0 snap-center"
						role="group"
						aria-roledescription="slide"
						aria-label={`${index + 1} / ${banners.length}`}
					>
						<BannerSlide banner={banner} locale={translate.locale} isPriority={index === 0} />
					</div>
				))}
			</div>

			{banners.length > 1 && (
				<>
					<button
						type="button"
						onClick={() => goTo(activeIndex - 1)}
						aria-label={translate('common.previousBanner')}
						className="absolute top-1/2 left-3 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition hover:bg-white sm:flex dark:bg-gray-900/85 dark:text-gray-100 dark:hover:bg-gray-900"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						type="button"
						onClick={() => goTo(activeIndex + 1)}
						aria-label={translate('common.nextBanner')}
						className="absolute top-1/2 right-3 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition hover:bg-white sm:flex dark:bg-gray-900/85 dark:text-gray-100 dark:hover:bg-gray-900"
					>
						<ChevronRight className="h-5 w-5" />
					</button>

					<div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-10">
						{banners.map((banner, index) => (
							<button
								key={banner.id}
								type="button"
								onClick={() => goTo(index)}
								aria-label={`${translate('common.goToBanner')} ${index + 1}`}
								aria-current={index === activeIndex}
								className={cn(
									'h-2 cursor-pointer rounded-full transition-all',
									index === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/55 hover:bg-white/80',
								)}
							/>
						))}
					</div>
				</>
			)}
		</section>
	);
}
