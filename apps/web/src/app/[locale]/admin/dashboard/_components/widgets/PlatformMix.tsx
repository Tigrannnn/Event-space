'use client';

import type { DashboardStats } from '@event-space/shared';
import { getPercent } from '../DashboardUtils';
import { useTranslation } from '@/hooks/translation';

interface PlatformMixProps {
	stats: DashboardStats;
}

export default function PlatformMix({ stats }: PlatformMixProps) {
	const translate = useTranslation();
	const bookingStatusTotal =
		stats.confirmedBookings + stats.pendingBookings + stats.cancelledBookings;
	const eventStatusTotal =
		stats.events.published + stats.events.draft + stats.events.cancelled;

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="font-semibold text-gray-900 dark:text-gray-100">{translate('admin.platformMix')}</h2>
			<p className="mb-5 text-sm text-gray-500">{translate('admin.platformMixDescription')}</p>

			<div className="space-y-5">
				<StatusBars
					title={translate('admin.bookingStatus')}
					total={bookingStatusTotal}
					items={[
						{ label: translate('admin.confirmed'), value: stats.confirmedBookings },
						{ label: translate('admin.pending'), value: stats.pendingBookings },
						{ label: translate('admin.cancelled'), value: stats.cancelledBookings },
					]}
				/>
				<StatusBars
					title={translate('admin.eventStatus')}
					total={eventStatusTotal}
					items={[
						{ label: translate('admin.published'), value: stats.events.published },
						{ label: translate('admin.draft'), value: stats.events.draft },
						{ label: translate('admin.cancelled'), value: stats.events.cancelled },
					]}
				/>
			</div>
		</section>
	);
}

function StatusBars({
	title,
	total,
	items,
}: {
	title: string;
	total: number;
	items: Array<{ label: string; value: number }>;
}) {
	return (
		<div>
			<div className="mb-3 flex items-center justify-between">
				<p className="text-sm font-semibold">{title}</p>
				<p className="text-sm text-gray-500">{total.toLocaleString()}</p>
			</div>
			<div className="space-y-2">
				{items.map((item) => (
					<div key={item.label}>
						<div className="mb-1 flex items-center justify-between text-sm">
							<span className="text-gray-500">{item.label}</span>
							<span className="font-medium">{item.value.toLocaleString()}</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
							<div
								className="bg-primary h-full rounded-full"
								style={{ width: `${getPercent(item.value, total)}%` }}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
