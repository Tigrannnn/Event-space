'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { refFromSearch, rememberSourceRef, withoutSourceParams } from '@/utils/sourceRef';

export default function SourceRefTracker() {
	const pathname = usePathname();

	useEffect(() => {
		const ref = refFromSearch(window.location.search);
		if (ref) rememberSourceRef(ref);

		const cleanUrl = withoutSourceParams(window.location.href);
		if (cleanUrl !== window.location.href) window.history.replaceState(null, '', cleanUrl);
	}, [pathname]);

	return null;
}
