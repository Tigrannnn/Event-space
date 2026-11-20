'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { refFromSearch, rememberSourceRef } from '@/utils/sourceRef';

export default function SourceRefTracker() {
	const pathname = usePathname();

	useEffect(() => {
		const ref = refFromSearch(window.location.search);
		if (ref) rememberSourceRef(ref);
	}, [pathname]);

	return null;
}
