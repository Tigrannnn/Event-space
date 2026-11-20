'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { platformFromReferrer } from '@event-space/shared';
import { stripLocaleFromPathname } from '@/lib/i18n/config';
import { tourIdFromPath, trackAnalytics } from '@/utils/analytics';
import { refFromSearch, rememberSourceRef, withoutSourceParams } from '@/utils/sourceRef';

let arrivalHandled = false;

function rememberArrival() {
	if (arrivalHandled) return;
	arrivalHandled = true;

	const source =
		refFromSearch(window.location.search) ?? platformFromReferrer(document.referrer, window.location.hostname);
	if (source) rememberSourceRef(source);
}

export default function SourceRefTracker() {
	const pathname = usePathname();

	useEffect(() => {
		rememberArrival();

		const cleanUrl = withoutSourceParams(window.location.href);
		if (cleanUrl !== window.location.href) window.history.replaceState(null, '', cleanUrl);

		if (stripLocaleFromPathname(pathname).startsWith('/admin')) return;

		trackAnalytics('VISIT');
		const tourId = tourIdFromPath(pathname);
		if (tourId) trackAnalytics('TOUR_VIEW', tourId);
	}, [pathname]);

	return null;
}
