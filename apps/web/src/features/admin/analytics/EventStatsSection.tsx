'use client';

import { useState } from 'react';
import FlowChart from '@/app/[locale]/admin/dashboard/_components/widgets/FlowChart';
import FlowKpiCards from '@/app/[locale]/admin/dashboard/_components/widgets/FlowKpiCards';
import FlowPaymentMixWidget from '@/app/[locale]/admin/dashboard/_components/widgets/FlowPaymentMixWidget';
import { useDashboardFlow } from '@/features/admin/hooks/useAdmin';
import { useTranslation } from '@/hooks/translation';
import EventFunnelCard from './EventFunnelCard';
import StatsRangePicker from './StatsRangePicker';
import { lastDaysRange } from './statsRange';

const DEFAULT_DAYS = 30;

export default function EventStatsSection({ eventId }: { eventId: string }) {
	const translate = useTranslation();
	const [range, setRange] = useState(() => lastDaysRange(DEFAULT_DAYS));
	const { data: flow, isLoading } = useDashboardFlow(range.from, range.to, eventId);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<p className="text-sm font-semibold text-gray-900 dark:text-white">{translate('admin.tourStats')}</p>
					<p className="text-xs text-gray-500 dark:text-gray-400">{translate('admin.revenueViewCashHint')}</p>
				</div>
				<StatsRangePicker value={range} onChange={setRange} />
			</div>
			<FlowKpiCards flow={flow} isLoading={isLoading} />
			<FlowChart flow={flow} isLoading={isLoading} />
			<FlowPaymentMixWidget flow={flow} isLoading={isLoading} />
			<EventFunnelCard eventId={eventId} range={range} />
		</div>
	);
}
