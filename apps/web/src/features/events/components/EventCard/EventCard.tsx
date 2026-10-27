'use client';

import { useSkin } from '@/providers/BrandProvider';
import EventCardClassic from './EventCardClassic';
import EventCardMinimal from './EventCardMinimal';
import type { EventCardProps } from './useEventCardState';

export type { EventCardProps };

export default function EventCard(props: EventCardProps) {
	const skin = useSkin();

	return skin === 'minimal' ? <EventCardMinimal {...props} /> : <EventCardClassic {...props} />;
}
