'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/hooks/translation';

interface PhotoStripProps {
	children: ReactNode;
	/** The sizing the strip takes from its surroundings (a fixed height, filling a section). */
	className?: string;
	/** The scrolling row itself: frame, background, padding. */
	scrollerClassName?: string;
}

/**
 * A row of photos that scrolls sideways, with arrows over its edges for a mouse.
 *
 * The scrollbar is hidden and a wheel only moves the page, so on a computer the photos past
 * the first screen could not be reached at all. Each arrow appears only while there is more to
 * see on its side, and only from the sm breakpoint up: a finger swipes.
 */
export function PhotoStrip({ children, className, scrollerClassName }: PhotoStripProps) {
	const translate = useTranslation();
	const scrollerRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const updateEdges = useCallback(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return;
		setCanScrollLeft(scroller.scrollLeft > 1);
		setCanScrollRight(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1);
	}, []);

	useEffect(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return;

		updateEdges();
		scroller.addEventListener('scroll', updateEdges, { passive: true });

		// Photos arrive one by one and change the width of the row as they do.
		const observer = new ResizeObserver(updateEdges);
		observer.observe(scroller);
		if (scroller.firstElementChild) observer.observe(scroller.firstElementChild);

		return () => {
			scroller.removeEventListener('scroll', updateEdges);
			observer.disconnect();
		};
	}, [updateEdges]);

	const scrollByView = (direction: -1 | 1) => {
		const scroller = scrollerRef.current;
		if (!scroller) return;
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		scroller.scrollBy({
			left: direction * scroller.clientWidth * 0.8,
			behavior: reduceMotion ? 'auto' : 'smooth',
		});
	};

	const arrowClassName =
		'absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur-sm transition-colors hover:bg-white sm:flex dark:bg-gray-900/90 dark:text-white dark:hover:bg-gray-900';

	return (
		<div className={cn('relative', className)}>
			<div
				ref={scrollerRef}
				className={cn('scrollbar-hide h-full w-full snap-x snap-mandatory overflow-x-auto', scrollerClassName)}
			>
				{children}
			</div>

			{canScrollLeft && (
				<button
					type="button"
					tabIndex={-1}
					onClick={() => scrollByView(-1)}
					aria-label={translate('common.scrollLeft')}
					className={cn(arrowClassName, 'left-3')}
				>
					<ChevronLeft className="size-5" />
				</button>
			)}

			{canScrollRight && (
				<button
					type="button"
					tabIndex={-1}
					onClick={() => scrollByView(1)}
					aria-label={translate('common.scrollRight')}
					className={cn(arrowClassName, 'right-3')}
				>
					<ChevronRight className="size-5" />
				</button>
			)}
		</div>
	);
}
