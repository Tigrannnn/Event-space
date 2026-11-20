'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useSourceStats } from '@/features/admin/hooks/useAdmin';
import { useFormatDate } from '@/hooks/format';
import { useSourceLabel } from '@/hooks/labels/useSourceLabel';
import { useTranslation } from '@/hooks/translation';
import { localizePath } from '@/lib/i18n/config';
import { toChartDate } from '../chart-utils';
import ChartTooltip from './ChartTooltip';

interface SourceSummaryWidgetProps {
	from: string;
	to: string;
}

const TOP_SOURCES = 5;

export default function SourceSummaryWidget({ from, to }: SourceSummaryWidgetProps) {
	const translate = useTranslation();
	const sourceLabel = useSourceLabel();
	const { formatDateShort, formatDateYear } = useFormatDate();
	const { data, isLoading } = useSourceStats(from, to);

	const href = `${localizePath('/admin/traffic', translate.locale)}?from=${from}&to=${to}`;
	const top = (data?.rows ?? []).filter((row) => row.source && row.visitors > 0).slice(0, TOP_SOURCES);

	const numbers = [
		{ label: translate('admin.statsVisitors'), value: data?.totals.visitors },
		{ label: translate('admin.statsViewedTours'), value: data?.totals.viewedTours },
		{ label: translate('admin.statsStartedBooking'), value: data?.totals.startedBooking },
		{ label: translate('admin.statsSiteBookings'), value: data?.totals.siteBookings },
	];

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">{translate('admin.statsSummaryTitle')}</h2>

			<div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
				{numbers.map((item) => (
					<div key={item.label} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
						<p className="text-xs text-gray-500">{item.label}</p>
						<p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
							{isLoading ? '…' : (item.value ?? 0)}
						</p>
					</div>
				))}
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="h-56 w-full lg:col-span-2">
					{data && (
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={data.days} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
									name={translate('admin.statsVisitorsPerDay')}
									stroke="var(--color-primary)"
									fill="var(--color-primary)"
									fillOpacity={0.15}
									strokeWidth={2}
								/>
							</AreaChart>
						</ResponsiveContainer>
					)}
				</div>

				<div className="flex flex-col">
					<p className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
						{translate('admin.statsTopSources')}
					</p>
					<ul className="space-y-1.5 text-sm">
						{top.map((row) => (
							<li key={row.source?.id} className="flex justify-between gap-3">
								<span className="truncate text-gray-900 dark:text-gray-100">{sourceLabel(row)}</span>
								<span className="font-medium text-gray-900 tabular-nums dark:text-gray-100">{row.visitors}</span>
							</li>
						))}
						{!isLoading && top.length === 0 && <li className="text-gray-500">—</li>}
					</ul>
					<Link
						href={href}
						className="text-primary mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
					>
						{translate('admin.statsMore')}
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>
		</section>
	);
}
