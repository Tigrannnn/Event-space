'use client';

import { Suspense, useEffect, useState } from 'react';
import Header from './Header';
import TopBar from '@/components/ui/TopBar';

export default function HeaderWrapper() {
	const [isTopBarVisible, setIsTopBarVisible] = useState(true);

	useEffect(() => {
		const mainEl = document.querySelector('main');
		const readScroll = () => (mainEl ? (mainEl.scrollTop as number) : window.scrollY);

		const handleScroll = () => {
			const currentScroll = readScroll();

			if (currentScroll >= 5) {
				setIsTopBarVisible(false);
			} else {
				setIsTopBarVisible(true);
			}
		};

		if (mainEl) {
			mainEl.addEventListener('scroll', handleScroll, { passive: true });
			return () => mainEl.removeEventListener('scroll', handleScroll);
		}

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<Suspense fallback={<div className="h-20 animate-pulse bg-gray-100" />}>
			<div className="sticky top-0 z-50">
				<TopBar isTopBarVisible={isTopBarVisible} />
				<Header />
			</div>
		</Suspense>
	);
}
