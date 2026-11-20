'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import clientApi from '@/lib/client.api';
import { stripLocaleFromPathname } from '@/lib/i18n/config';
import { tourIdFromPath, trackAnalytics } from '@/utils/analytics';
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

		if (stripLocaleFromPathname(pathname).startsWith('/admin')) return;

		trackAnalytics('VISIT');
		const tourId = tourIdFromPath(pathname);
		if (tourId) trackAnalytics('TOUR_VIEW', tourId);
	}, [pathname]);

	return null;
}
