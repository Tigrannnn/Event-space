'use client';

import { useState } from 'react';
import { useTourFunnel } from '@/features/admin/hooks/useAdmin';
import { useTranslation } from '@/hooks/translation';
import StatsRangePicker from './StatsRangePicker';
import { lastDaysRange } from './statsRange';
import { percent } from './tourFunnel';

const DEFAULT_DAYS = 30;

export default function EventFunnelCard({ eventId }: { eventId: string }) {
	const translate = useTranslation();
	const [range, setRange] = useState(() => lastDaysRange(DEFAULT_DAYS));
	const { data } = useTourFunnel(range.from, range.to, eventId);
	const row = data?.[0];

	const steps = [
		{ label: translate('admin.tourViews'), value: row?.views },
		{ label: translate('admin.tourFavorites'), value: row?.favorites },
		{ label: translate('admin.tourStarted'), value: row?.started },
		{ label: translate('admin.tourBooked'), value: row?.booked },
	];

	return (
		<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
					{translate('admin.tourFunnel')}
				</p>
				<StatsRangePicker value={range} onChange={setRange} />
			</div>
			<div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
				{steps.map((step) => (
					<div key={step.label}>
						<p className="text-xl font-semibold text-gray-900 dark:text-white">{step.value ?? '—'}</p>
						<p className="text-xs text-gray-500 dark:text-gray-400">{step.label}</p>
					</div>
				))}
			</div>
			{row && row.views > 0 && (
				<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
					{translate('admin.statsConversion')}: {percent(row.booked, row.views)}
				</p>
			)}
		</div>
	);
}
