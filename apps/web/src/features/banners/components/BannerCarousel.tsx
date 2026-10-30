'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner, BrandSkin } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useSkin } from '@/providers/BrandProvider';
import { cn } from '@/utils/cn';
import BannerSlide from './BannerSlide';

interface BannerCarouselProps {
	banners: Banner[];
}

const AUTOPLAY_MS = 5000;

/**
 * The position indicator under or over the slides, one per skin: white pills on the photo for
 * classic, thin segments under the banner for minimal, square dots on a dark tab for listing,
 * and dots in a floating white capsule for soft.
 */
const INDICATOR: Record<
	BrandSkin,
	{ container: string; dot: string; active: string; inactive: string }
> = {
	classic: {
		container: 'absolute bottom-7 left-1/2 -translate-x-1/2 gap-2 sm:bottom-10',
		dot: 'h-2 rounded-full',
		active: 'w-6 bg-white',
		inactive: 'w-2 bg-white/55 hover:bg-white/80',
	},
	minimal: {
		container: 'mt-3 justify-center gap-1.5',
		dot: 'h-1 w-10 rounded-full',
		active: 'bg-gray-900 dark:bg-white',
		inactive: 'bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700',
	},
	listing: {
		container: 'absolute right-3 bottom-7 gap-1.5 rounded bg-black/45 px-2.5 py-2 sm:bottom-9',
		dot: 'size-2 rounded-[2px]',
		active: 'bg-white',
		inactive: 'bg-white/40 hover:bg-white/70',
	},
	soft: {
		container:
			'absolute bottom-7 left-1/2 -translate-x-1/2 items-center gap-2 rounded-full bg-black/25 px-3 py-2 backdrop-blur-sm sm:bottom-9',
		dot: 'rounded-full',
		active: 'size-3 bg-white',
		inactive: 'size-2 bg-white/50 hover:bg-white/80',
	},
	market: {
		container: 'absolute bottom-7 left-1/2 -translate-x-1/2 gap-1.5 sm:bottom-9',
		dot: 'h-1.5 rounded-full',
		active: 'w-5 bg-white',
		inactive: 'w-1.5 bg-white/60 hover:bg-white/80',
	},
	drawer: {
		container: 'absolute bottom-7 left-6 sm:bottom-10 sm:left-10',
		dot: '',
		active: '',
		inactive: '',
	},
};

/**
 * The previous/next buttons, one look per skin so no two skins share them: a white disc for
 * classic, an outlined disc beside the dots for minimal, dark squares for listing, big white
 * discs with arrows for soft and tall slim white tabs for market.
 */
const ARROW: Record<
	BrandSkin,
	{ base: string; prev: string; next: string; arrows: boolean; icon: string }
> = {
	classic: {
		base:
			'h-10 w-10 rounded-full bg-white/90 text-gray-900 shadow-md hover:bg-white dark:bg-gray-900/85 dark:text-gray-100 dark:hover:bg-gray-900',
		prev: 'left-3',
		next: 'right-3',
		arrows: false,
		icon: 'h-5 w-5',
	},
	minimal: {
		base:
			'h-9 w-9 rounded-full border border-gray-900 bg-white text-gray-900 hover:bg-gray-900 hover:text-white dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:bg-white dark:hover:text-neutral-950',
		prev: 'top-auto right-16 bottom-14 left-auto translate-y-0',
		next: 'top-auto right-3 bottom-14 translate-y-0',
		arrows: false,
		icon: 'h-4 w-4',
	},
	listing: {
		base: 'h-10 w-10 rounded-sm bg-black/50 text-white hover:bg-black/75',
		prev: 'left-0',
		next: 'right-0',
		arrows: false,
		icon: 'h-5 w-5',
	},
	soft: {
		base:
			'size-11 rounded-full bg-white text-primary shadow-lg ring-4 ring-white/40 hover:scale-105 dark:bg-gray-800',
		prev: 'left-3',
		next: 'right-3',
		arrows: true,
		icon: 'h-5 w-5',
	},
	market: {
		base:
			'h-16 w-9 rounded-xl bg-white/95 text-gray-900 shadow-sm hover:bg-white dark:bg-neutral-900/90 dark:text-white dark:hover:bg-neutral-900',
		prev: 'left-3',
		next: 'right-3',
		arrows: false,
		icon: 'h-5 w-5',
	},
	drawer: {
		base:
			'size-11 rounded-full border border-white/70 bg-black/25 text-white backdrop-blur-sm hover:bg-white hover:text-gray-900',
		prev: 'top-auto right-20 bottom-9 left-auto translate-y-0',
		next: 'top-auto right-8 bottom-9 translate-y-0',
		arrows: true,
		icon: 'h-4 w-4',
	},
};

export default function BannerCarousel({ banners }: BannerCarouselProps) {
	const translate = useTranslation();
	const skin = useSkin();
	const isMinimal = skin === 'minimal';
	const isListing = skin === 'listing';
	const isSoft = skin === 'soft';
	const isMarket = skin === 'market';
	const isDrawer = skin === 'drawer';
	const scrollerRef = useRef<HTMLDivElement>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);

	// The slide a click or the autoplay is scrolling to. While it is set, the scroll position on
	// the way there is not the active slide: reading it would flip the indicator back to the slide
	// being left and only then forward again.
	const targetIndexRef = useRef<number | null>(null);
	const targetTimerRef = useRef<number | null>(null);

	const clearTarget = useCallback(() => {
		targetIndexRef.current = null;
		if (targetTimerRef.current !== null) {
			window.clearTimeout(targetTimerRef.current);
			targetTimerRef.current = null;
		}
	}, []);

	const readActiveIndex = useCallback(() => {
		const scroller = scrollerRef.current;
		if (!scroller || scroller.clientWidth === 0) return;

		setActiveIndex(Math.round(scroller.scrollLeft / scroller.clientWidth));
	}, []);

	const scrollToIndex = useCallback(
		(index: number) => {
			const scroller = scrollerRef.current;
			if (!scroller) return;

			clearTarget();
			targetIndexRef.current = index;
			// A scroll that never arrives (interrupted, or already in place) must not freeze the indicator.
			targetTimerRef.current = window.setTimeout(() => {
				clearTarget();
				readActiveIndex();
			}, 1000);

			scroller.scrollTo({ left: scroller.clientWidth * index, behavior: 'smooth' });
		},
		[clearTarget, readActiveIndex],
	);

	const updateActiveIndex = useCallback(() => {
		const scroller = scrollerRef.current;
		if (!scroller || scroller.clientWidth === 0) return;

		const target = targetIndexRef.current;
		if (target !== null) {
			if (Math.abs(scroller.scrollLeft - scroller.clientWidth * target) > 2) return;

			clearTarget();
			setActiveIndex(target);
			return;
		}

		readActiveIndex();
	}, [clearTarget, readActiveIndex]);

	useEffect(() => clearTarget, [clearTarget]);

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
			className={cn(
				'relative py-4 sm:py-6',
				isListing && 'mx-auto w-full max-w-[1336px]',
				isMarket && 'mx-auto w-full max-w-[1400px]',
				isDrawer && 'mx-auto w-full max-w-[1400px]',
			)}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			onFocusCapture={() => setIsPaused(true)}
			onBlurCapture={() => setIsPaused(false)}
		>
			<div
				ref={scrollerRef}
				onPointerDown={clearTarget}
				onWheel={clearTarget}
				className={cn(
					'flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overflow-y-hidden rounded-2xl [&::-webkit-scrollbar]:hidden',
					isMinimal
						? 'h-[23rem] border border-gray-200 sm:h-72 dark:border-neutral-800'
						: isListing
							? 'h-56 rounded-lg border border-gray-200 sm:h-80 dark:border-neutral-800'
							: isSoft
								? 'aspect-16/9 rounded-3xl shadow-lg ring-4 ring-white sm:aspect-16/6 dark:ring-gray-800'
								: isDrawer
									? 'aspect-4/3 rounded-[2rem] sm:aspect-16/6'
									: isMarket
										? 'aspect-2/1 sm:aspect-16/5'
										: 'aspect-16/9 sm:aspect-16/5 sm:rounded-3xl',
				)}
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
					{(['prev', 'next'] as const).map((direction) => {
						const isPrev = direction === 'prev';
						const look = ARROW[skin];
						const Icon = look.arrows
							? isPrev
								? ArrowLeft
								: ArrowRight
							: isPrev
								? ChevronLeft
								: ChevronRight;

						return (
							<button
								key={direction}
								type="button"
								onClick={() => goTo(activeIndex + (isPrev ? -1 : 1))}
								aria-label={translate(isPrev ? 'common.previousBanner' : 'common.nextBanner')}
								className={cn(
									'absolute top-1/2 hidden -translate-y-1/2 cursor-pointer items-center justify-center transition sm:flex',
									look.base,
									isPrev ? look.prev : look.next,
								)}
							>
								<Icon className={look.icon} />
							</button>
						);
					})}

					{isDrawer ? (
						<div
							aria-live="polite"
							className={cn('flex items-center gap-3 text-white tabular-nums', INDICATOR.drawer.container)}
						>
							<span className="text-2xl leading-none font-black sm:text-3xl">
								{String(activeIndex + 1).padStart(2, '0')}
							</span>
							<span className="h-px w-8 bg-white/60 sm:w-12" />
							<span className="text-sm font-medium text-white/70">
								{String(banners.length).padStart(2, '0')}
							</span>
						</div>
					) : isMarket ? (
						<div
							aria-live="polite"
							className="absolute right-4 bottom-7 rounded-lg bg-black/55 px-2.5 py-1 text-xs font-semibold text-white tabular-nums sm:right-6 sm:bottom-9"
						>
							{activeIndex + 1} / {banners.length}
						</div>
					) : (
						<div className={cn('flex', INDICATOR[skin].container)}>
							{banners.map((banner, index) => (
								<button
									key={banner.id}
									type="button"
									onClick={() => goTo(index)}
									aria-label={`${translate('common.goToBanner')} ${index + 1}`}
									aria-current={index === activeIndex}
									className={cn(
										'cursor-pointer transition-all',
										INDICATOR[skin].dot,
										index === activeIndex ? INDICATOR[skin].active : INDICATOR[skin].inactive,
									)}
								/>
							))}
						</div>
					)}
				</>
			)}
		</section>
	);
}
