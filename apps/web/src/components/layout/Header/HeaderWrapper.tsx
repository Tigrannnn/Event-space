'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Header from './Header';
import TopBar from '@/components/ui/TopBar';
import { usePathname } from 'next/navigation';
import { isRouteActive } from '@/utils/route';

/**
 * Hysteresis rather than one threshold: collapsing the top bar shortens the page by
 * its own height, which nudges the scroll position back up. A single threshold would
 * re-show the bar and flip the state every frame. The gap between the two values is
 * wider than the bar is tall, so a nudged position lands inside the hidden band and
 * the state settles.
 */
const HIDE_TOP_BAR_AT = 96;
const SHOW_TOP_BAR_AT = 16;

export default function HeaderWrapper() {
	const pathname = usePathname();
	const isAdminPage = isRouteActive(pathname, '/admin');

	const [isTopBarVisible, setIsTopBarVisible] = useState(true);
	// The scroll listener is bound once, so it reads the current state from a ref
	// rather than from a closure captured on mount.
	const isTopBarVisibleRef = useRef(true);

	useEffect(() => {
		const handleScroll = () => {
			const currentScroll = window.scrollY;
			const nextVisible = isTopBarVisibleRef.current
				? currentScroll < HIDE_TOP_BAR_AT
				: currentScroll <= SHOW_TOP_BAR_AT;

			if (nextVisible === isTopBarVisibleRef.current) return;

			isTopBarVisibleRef.current = nextVisible;
			setIsTopBarVisible(nextVisible);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	if (isAdminPage) {
		return null;
	}

	return (
		<Suspense fallback={<div className="h-20 animate-pulse bg-gray-100" />}>
			<div className="sticky top-0 z-50">
				<TopBar isTopBarVisible={isTopBarVisible} />
				<Header />
			</div>
		</Suspense>
	);
}
