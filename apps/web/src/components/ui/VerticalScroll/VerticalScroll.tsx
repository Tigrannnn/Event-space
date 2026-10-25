'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { cn } from '@/utils/cn';
import { centerInScroller } from '@/utils/scroll';

interface VerticalScrollProps {
	children: ReactNode;
	/** Height the list is allowed to take before it starts scrolling on its own. */
	className?: string;
	/** Layout of the items inside: gap, padding. */
	contentClassName?: string;
	/** Gradient start colour for the edge fades — has to match whatever is behind the list. */
	fadeClassName?: string;
	/**
	 * Item to centre in the list once it is on screen. Scrolls this list alone, unlike
	 * `scrollIntoView`, which also drags every scrollable parent — the modal around it included.
	 */
	scrollToRef?: RefObject<HTMLElement | null>;
}

export function VerticalScroll({
	children,
	className,
	contentClassName,
	fadeClassName = 'from-white dark:from-gray-900',
	scrollToRef,
}: VerticalScrollProps) {
	const scrollerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [canScrollUp, setCanScrollUp] = useState(false);
	const [canScrollDown, setCanScrollDown] = useState(false);

	const updateEdges = useCallback(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return;
		setCanScrollUp(scroller.scrollTop > 1);
		setCanScrollDown(scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1);
	}, []);

	useEffect(() => {
		const scroller = scrollerRef.current;
		const content = contentRef.current;
		if (!scroller || !content) return;

		updateEdges();
		scroller.addEventListener('scroll', updateEdges, { passive: true });

		const observer = new ResizeObserver(updateEdges);
		observer.observe(scroller);
		observer.observe(content);

		return () => {
			scroller.removeEventListener('scroll', updateEdges);
			observer.disconnect();
		};
	}, [updateEdges]);

	useEffect(() => {
		if (scrollToRef) centerInScroller(scrollerRef.current, scrollToRef.current);
	}, [scrollToRef]);

	return (
		<div className="relative">
			<div ref={scrollerRef} className={cn('overflow-y-auto', className)}>
				<div ref={contentRef} className={contentClassName}>
					{children}
				</div>
			</div>

			{canScrollUp && (
				<div
					className={cn(
						'pointer-events-none absolute inset-x-0 top-0 h-8 bg-linear-to-b to-transparent',
						fadeClassName,
					)}
				/>
			)}

			{canScrollDown && (
				<div
					className={cn(
						'pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t to-transparent',
						fadeClassName,
					)}
				/>
			)}
		</div>
	);
}
