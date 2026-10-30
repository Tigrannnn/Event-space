'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ScrollFadeProps {
	children: ReactNode;
	/** Sizing and layout of the scrolling area, including the height it stops growing at. */
	className?: string;
	/** Used as the role of the scrolling element (a radio group, a listbox). */
	role?: string;
}

const FADE_PX = 28;

/**
 * A list that scrolls, with its edges dissolving into the page where more lies beyond them,
 * instead of being sliced off by a hard line mid-card. It is a mask on the list itself, so it
 * works on any background, in either theme, in every skin.
 */
export function ScrollFade({ children, className, role }: ScrollFadeProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [edges, setEdges] = useState({ top: false, bottom: false });

	const update = useCallback(() => {
		const element = ref.current;
		if (!element) return;

		const top = element.scrollTop > 1;
		const bottom = element.scrollTop + element.clientHeight < element.scrollHeight - 1;

		setEdges((current) => (current.top === top && current.bottom === bottom ? current : { top, bottom }));
	}, []);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		update();
		element.addEventListener('scroll', update, { passive: true });

		const observer = new ResizeObserver(update);
		observer.observe(element);
		if (element.firstElementChild) observer.observe(element.firstElementChild);

		return () => {
			element.removeEventListener('scroll', update);
			observer.disconnect();
		};
	}, [update]);

	const mask = `linear-gradient(to bottom, ${edges.top ? 'transparent' : '#000'} 0, #000 ${
		edges.top ? FADE_PX : 0
	}px, #000 calc(100% - ${edges.bottom ? FADE_PX : 0}px), ${edges.bottom ? 'transparent' : '#000'} 100%)`;
	const style: CSSProperties = { maskImage: mask, WebkitMaskImage: mask };

	return (
		<div ref={ref} role={role} style={style} className={cn('overflow-y-auto', className)}>
			{children}
		</div>
	);
}
