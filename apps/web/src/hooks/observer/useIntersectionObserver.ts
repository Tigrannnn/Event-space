'use client';

import { useEffect, useRef, RefObject, useCallback } from 'react';

interface UseIntersectionObserverOptions {
	threshold?: number;
	rootMargin?: string;
	enabled?: boolean;
}

export function useIntersectionObserver(
	onIntersect: () => void,
	options: UseIntersectionObserverOptions = {}
): RefObject<HTMLDivElement | null> {
	const { threshold = 0.1, rootMargin = '200px', enabled = true } = options;
	const targetRef = useRef<HTMLDivElement>(null);

	const handleIntersect = useCallback(
		([entry]: IntersectionObserverEntry[]) => {
			if (entry.isIntersecting) {
				onIntersect();
			}
		},
		[onIntersect]
	);

	useEffect(() => {
		if (!enabled) return;

		const element = targetRef.current;
		if (!element) return;

		const observer = new IntersectionObserver(handleIntersect, {
			threshold,
			rootMargin,
		});

		observer.observe(element);
		return () => observer.disconnect();
	}, [handleIntersect, threshold, rootMargin, enabled]);

	return targetRef;
}
