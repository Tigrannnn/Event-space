'use client';

import { useSkin } from '@/providers/BrandProvider';
import EventCardClassic from './EventCardClassic';
import EventCardMinimal from './EventCardMinimal';
import EventCardListing from './EventCardListing';
import EventCardSoft from './EventCardSoft';
import EventCardMarket from './EventCardMarket';
import type { EventCardProps } from './useEventCardState';

export type { EventCardProps };

export default function EventCard(props: EventCardProps) {
	const skin = useSkin();

	if (skin === 'minimal') return <EventCardMinimal {...props} />;
	if (skin === 'listing') return <EventCardListing {...props} />;
	if (skin === 'soft') return <EventCardSoft {...props} />;
	if (skin === 'market') return <EventCardMarket {...props} />;

	return <EventCardClassic {...props} />;
}
