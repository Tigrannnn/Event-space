'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TrafficSourceRow } from '@event-space/shared';
import { useTraffic } from '@/features/admin/hooks/useAdmin';
import { useFormatDate } from '@/hooks/format';
import { useTranslation } from '@/hooks/translation';
import { toChartDate } from '../chart-utils';
import ChartTooltip from './ChartTooltip';

interface TrafficWidgetProps {
	from: string;
	to: string;
}

export default function TrafficWidget({ from, to }: TrafficWidgetProps) {
	const translate = useTranslation();
	const { formatDateShort, formatDateYear } = useFormatDate();
	const { data: traffic, isLoading } = useTraffic(from, to);

	if (isLoading || !traffic) {
		return (
			<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
				<div className="h-72 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
			</section>
		);
	}

	const sourceLabel = (row: TrafficSourceRow) => {
		if (row.name) return row.name;
		if (row.ref) return translate('admin.sourceUnknownRef', { ref: row.ref });
		return translate('admin.trafficDirect');
	};

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="font-semibold text-gray-900 dark:text-gray-100">{translate('admin.traffic')}</h2>
			<p className="mb-4 text-sm text-gray-500">{translate('admin.trafficHint')}</p>

			<div className="mb-4 grid grid-cols-2 gap-3 sm:max-w-md">
				<div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
					<p className="text-xs text-gray-500">{translate('admin.trafficVisitors')}</p>
					<p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{traffic.visitors}</p>
				</div>
				<div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
					<p className="text-xs text-gray-500">{translate('admin.trafficVisits')}</p>
					<p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{traffic.visits}</p>
				</div>
			</div>

			{traffic.visits === 0 ? (
				<p className="text-sm text-gray-500">{translate('admin.trafficEmpty')}</p>
			) : (
				<div className="grid gap-6 lg:grid-cols-3">
					<div className="h-56 w-full lg:col-span-2">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={traffic.points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
								<CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
								<XAxis
									dataKey="date"
									tickFormatter={(value) => {
										const date = toChartDate(value);
										return date ? formatDateShort(date) : String(value ?? '');
									}}
									tick={{ fontSize: 12 }}
									minTickGap={24}
								/>
								<YAxis tick={{ fontSize: 12 }} allowDecimals={false} width={40} />
								<Tooltip
									content={
										<ChartTooltip
											formatLabel={(label) => {
												const date = toChartDate(label);
												return date ? formatDateYear(date) : String(label ?? '');
											}}
											formatValue={(value) => value.toLocaleString()}
										/>
									}
								/>
								<Area
									type="monotone"
									dataKey="visitors"
									name={translate('admin.trafficVisitorsPerDay')}
									stroke="var(--color-primary)"
									fill="var(--color-primary)"
									fillOpacity={0.15}
									strokeWidth={2}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>

					<div>
						<p className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
							{translate('admin.trafficBySource')}
						</p>
						<ul className="space-y-1.5 text-sm">
							{traffic.bySource.map((row) => (
								<li key={row.sourceId ?? row.ref ?? 'direct'} className="flex justify-between gap-3">
									<span className={row.sourceId ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'}>
										{sourceLabel(row)}
									</span>
									<span className="font-semibold text-gray-900 dark:text-gray-100">{row.visitors}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</section>
	);
}
