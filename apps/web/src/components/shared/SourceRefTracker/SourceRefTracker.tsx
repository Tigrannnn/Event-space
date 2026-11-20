'use client';

import { useEffect } from 'react';
import clientApi from '@/lib/client.api';
import { useCurrentUser } from '@/features/users';
import { usePathname } from 'next/navigation';
import { platformFromReferrer } from '@event-space/shared';
import { stripLocaleFromPathname } from '@/lib/i18n/config';
import { tourIdFromPath, trackAnalytics } from '@/utils/analytics';
import { readSourceRef, refFromSearch, rememberSourceRef, withoutSourceParams } from '@/utils/sourceRef';

let arrivalHandled = false;
const usersWithSource = new Set<string>();

function rememberArrival() {
	if (arrivalHandled) return;
	arrivalHandled = true;

	const source =
		refFromSearch(window.location.search) ?? platformFromReferrer(document.referrer, window.location.hostname);
	if (source) rememberSourceRef(source);
}

export default function SourceRefTracker() {
	const pathname = usePathname();
	const { data: user } = useCurrentUser();

	useEffect(() => {
		rememberArrival();

		const cleanUrl = withoutSourceParams(window.location.href);
		if (cleanUrl !== window.location.href) window.history.replaceState(null, '', cleanUrl);

		if (stripLocaleFromPathname(pathname).startsWith('/admin')) return;

		trackAnalytics('VISIT');
		const tourId = tourIdFromPath(pathname);
		if (tourId) trackAnalytics('TOUR_VIEW', tourId);
	}, [pathname]);

	useEffect(() => {
		if (!user || user.role === 'ADMIN' || usersWithSource.has(user.id)) return;
		usersWithSource.add(user.id);
		rememberArrival();
		void clientApi
			.post('/analytics/user-source', { ref: readSourceRef() })
			.catch(() => usersWithSource.delete(user.id));
	}, [user]);

	return null;
}
