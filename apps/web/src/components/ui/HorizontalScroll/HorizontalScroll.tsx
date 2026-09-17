'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/hooks/translation';

interface HorizontalScrollProps {
	children: ReactNode;
	/** Layout of the items in the row: gap, alignment, height. */
	className?: string;
	/** Gradient start colour for the edge fades — has to match whatever is behind the row. */
	fadeClassName?: string;
}

/**
 * A row that scrolls sideways when its items don't fit, with arrow buttons at the edges.
 *
 * A plain mouse wheel only scrolls vertically, so without the arrows a desktop user with no
 * trackpad can't reach the hidden items at all. Each arrow shows only while there is something
 * to scroll to on its side. The wheel is deliberately not redirected sideways: that would stop
 * the page from scrolling whenever the pointer happens to rest on the row.
 */
export function HorizontalScroll({
	children,
	className,
	fadeClassName = 'from-white dark:from-gray-900',
}: HorizontalScrollProps) {
	const translate = useTranslation();
	const scrollerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const updateEdges = useCallback(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return;
		// A pixel of slack: fractional widths leave scrollLeft just short of the true end.
		setCanScrollLeft(scroller.scrollLeft > 1);
		setCanScrollRight(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1);
	}, []);

	useEffect(() => {
		const scroller = scrollerRef.current;
		const content = contentRef.current;
		if (!scroller || !content) return;

		updateEdges();
		scroller.addEventListener('scroll', updateEdges, { passive: true });

		// The row changes width with the window, and the content with what is selected — a date
		// range filled in makes its button wider — so both are watched, not just the window.
		const observer = new ResizeObserver(updateEdges);
		observer.observe(scroller);
		observer.observe(content);

		return () => {
			scroller.removeEventListener('scroll', updateEdges);
			observer.disconnect();
		};
	}, [updateEdges]);

	const scrollByView = (direction: -1 | 1) => {
		const scroller = scrollerRef.current;
		if (!scroller) return;
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		// Most of a view rather than all of it, so part of what was visible stays on screen.
		scroller.scrollBy({
			left: direction * scroller.clientWidth * 0.8,
			behavior: reduceMotion ? 'auto' : 'smooth',
		});
	};

	const arrowClassName =
		'pointer-events-auto flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700';

	return (
		<div className="relative min-w-0">
			<div
				ref={scrollerRef}
				className="[scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden"
			>
				{/* min-w-full keeps ml-auto working on an item while everything still fits. */}
				<div ref={contentRef} className={cn('flex w-max min-w-full', className)}>
					{children}
				</div>
			</div>

			{/* Not in the tab order: keyboard focus reaches the items directly, and the browser
			    scrolls each one into view as it is focused. */}
			{canScrollLeft && (
				<div
					className={cn(
						'pointer-events-none absolute inset-y-0 left-0 flex w-16 items-center bg-linear-to-r to-transparent',
						fadeClassName,
					)}
				>
					<button
						type="button"
						tabIndex={-1}
						onClick={() => scrollByView(-1)}
						aria-label={translate('common.scrollLeft')}
						className={arrowClassName}
					>
						<ChevronLeft className="size-4" />
					</button>
				</div>
			)}

			{canScrollRight && (
				<div
					className={cn(
						'pointer-events-none absolute inset-y-0 right-0 flex w-16 items-center justify-end bg-linear-to-l to-transparent',
						fadeClassName,
					)}
				>
					<button
						type="button"
						tabIndex={-1}
						onClick={() => scrollByView(1)}
						aria-label={translate('common.scrollRight')}
						className={arrowClassName}
					>
						<ChevronRight className="size-4" />
					</button>
				</div>
			)}
		</div>
	);
}
