'use client';

import { useSkin } from '@/providers/BrandProvider';
import EventCardSkeleton from './EventCardSkeleton';
import { eventsGridClass } from './events-grid';

export default function EventsGridSkeleton({ count = 8 }: { count?: number }) {
	const skin = useSkin();

	return (
		<div className={eventsGridClass(skin)}>
			{Array.from({ length: count }).map((_, i) => (
				<EventCardSkeleton key={i} />
			))}
		</div>
	);
}
