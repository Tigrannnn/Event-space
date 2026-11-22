'use client';

import { useLook, useSkin } from '@/providers/BrandProvider';
import EventCardSkeleton from './EventCardSkeleton';
import { eventsGridClass } from './events-grid';

export default function EventsGridSkeleton({ count = 8 }: { count?: number }) {
	const skin = useSkin();
	const look = useLook();

	return (
		<div className={eventsGridClass(skin, look)}>
			{Array.from({ length: count }).map((_, i) => (
				<EventCardSkeleton key={i} />
			))}
		</div>
	);
}
