'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/translation';
import EventFunnelCard from './EventFunnelCard';
import EventRevenueCard from './EventRevenueCard';
import StatsRangePicker from './StatsRangePicker';
import { allTimeRange } from './statsRange';

export default function EventStatsSection({ eventId }: { eventId: string }) {
	const translate = useTranslation();
	const [range, setRange] = useState(allTimeRange);

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm font-semibold text-gray-900 dark:text-white">{translate('admin.tourStats')}</p>
				<StatsRangePicker value={range} onChange={setRange} />
			</div>
			<EventRevenueCard eventId={eventId} range={range} />
			<EventFunnelCard eventId={eventId} range={range} />
		</div>
	);
}
