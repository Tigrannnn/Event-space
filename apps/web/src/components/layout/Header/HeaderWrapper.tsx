'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Header from './Header';
import HeaderMinimal from './HeaderMinimal';
import HeaderListing from './HeaderListing';
import { useSkin } from '@/providers/BrandProvider';
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
	const skin = useSkin();
	const isAdminPage = isRouteActive(pathname, '/admin');
	const headerRef = useRef<HTMLDivElement>(null);

	const [isTopBarVisible, setIsTopBarVisible] = useState(true);
	// The scroll listener is bound once, so it reads the current state from a ref
	// rather than from a closure captured on mount.
	const isTopBarVisibleRef = useRef(true);

	/**
	 * Publishes the header's height as `--header-height`.
	 *
	 * Anything else that sticks to the top needs this number, and it is not a constant: the
	 * header grows with the breakpoint and shrinks when the top bar collapses on scroll. A
	 * hard-coded offset is right at exactly one width and slides under the header everywhere
	 * else, which is what the booking sidebar used to do.
	 */
	useEffect(() => {
		const element = headerRef.current;
		if (!element) return;

		const publish = () => {
			document.documentElement.style.setProperty(
				'--header-height',
				`${Math.round(element.getBoundingClientRect().height)}px`,
			);
		};

		publish();

		const observer = new ResizeObserver(publish);
		observer.observe(element);

		return () => observer.disconnect();
	}, [isTopBarVisible]);

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
			<div ref={headerRef} className="sticky top-0 z-50">
				{skin === 'minimal' ? (
					<HeaderMinimal />
				) : skin === 'listing' ? (
					<HeaderListing />
				) : (
					<>
						<TopBar isTopBarVisible={isTopBarVisible} />
						<Header />
					</>
				)}
			</div>
		</Suspense>
	);
}
