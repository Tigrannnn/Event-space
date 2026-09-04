'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Header from './Header';
import TopBar from '@/components/ui/TopBar';
import { usePathname } from 'next/navigation';
import { isRouteActive } from '@/utils/route';

/**
 * Collapsing the top bar hands its height (max-h-12) back to <main>, which is the
 * scroll container — so <main> grows and its scrollable distance shrinks by the
 * same amount. On a page that only just overflows, the browser clamps the scroll
 * position back toward the top, which would re-show the bar and start the whole
 * thing over, flipping every transition. Keeping the two thresholds further apart
 * than the bar is tall means a clamped position always stays inside the hidden
 * band, so the state can settle.
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
		const mainEl = document.querySelector('main');
		const readScroll = () => (mainEl ? (mainEl.scrollTop as number) : window.scrollY);

		const handleScroll = () => {
			const currentScroll = readScroll();
			const nextVisible = isTopBarVisibleRef.current
				? currentScroll < HIDE_TOP_BAR_AT
				: currentScroll <= SHOW_TOP_BAR_AT;

			if (nextVisible === isTopBarVisibleRef.current) return;

			isTopBarVisibleRef.current = nextVisible;
			setIsTopBarVisible(nextVisible);
		};

		if (mainEl) {
			mainEl.addEventListener('scroll', handleScroll, { passive: true });
			return () => mainEl.removeEventListener('scroll', handleScroll);
		}

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
