'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import clientApi from '@/lib/client.api';
import { readSourceRef, refFromSearch, rememberSourceRef, withoutSourceParams } from '@/utils/sourceRef';

export default function SourceRefTracker() {
	const pathname = usePathname();

	useEffect(() => {
		const ref = refFromSearch(window.location.search);
		if (ref) {
			const isNewVisit = readSourceRef() !== ref;
			rememberSourceRef(ref);
			if (isNewVisit) void clientApi.post('/sources/visit', { ref }).catch(() => undefined);
		}

		const cleanUrl = withoutSourceParams(window.location.href);
		if (cleanUrl !== window.location.href) window.history.replaceState(null, '', cleanUrl);
	}, [pathname]);

	return null;
}
