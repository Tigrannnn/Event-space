'use client';

import { Suspense } from 'react';
import Header from './Header';
import TopBar from '@/components/ui/TopBar';

export default function HeaderWrapper() {
	return (
		<Suspense fallback={<div className="h-20 animate-pulse bg-gray-100" />}>
			<TopBar />
			<Header />
		</Suspense>
	);
}
