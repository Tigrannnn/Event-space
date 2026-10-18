'use client';

import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { toZonedDateKey, type DashboardRevenue } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useFormatCurrency, useFormatDate } from '@/hooks/format';
import { toChartDate } from '../chart-utils';
import ChartTooltip from './ChartTooltip';

interface RevenueChartProps {
	revenue?: DashboardRevenue;
	isLoading: boolean;
}

export default function RevenueChart({ revenue, isLoading }: RevenueChartProps) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const { formatDateShort, formatDateYear } = useFormatDate();

	if (isLoading || !revenue) {
		return (
			<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
				<div className="h-72 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
			</section>
		);
	}

	const hasAnyMoney = revenue.points.some(
		(point) => point.earned !== 0 || point.kept !== 0 || point.expected !== 0,
	);
	const today = toZonedDateKey(new Date());
	const showToday = revenue.points.some((point) => point.date === today);

	const finalLabel = translate('admin.revenueFinalLegend');
	const keptLabel = translate('admin.revenueKeptLegend');
	const expectedLabel = translate('admin.revenueExpectedLegend');

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="font-semibold text-gray-900 dark:text-gray-100">
				{translate('admin.revenueByTour')}
			</h2>
			<p className="mb-4 text-sm text-gray-500">{translate('admin.revenueByTourHint')}</p>

			{hasAnyMoney ? (
				<div className="h-72 w-full">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={revenue.points} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
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
							<YAxis tick={{ fontSize: 12 }} width={80} />
							<Tooltip
								content={
									<ChartTooltip
										formatLabel={(label) => {
											const date = toChartDate(label);
											return date ? formatDateYear(date) : String(label ?? '');
										}}
										formatValue={(value) => formatCurrency(value)}
									/>
								}
							/>
							<Legend />
							{showToday && (
								<ReferenceLine
									x={today}
									stroke="#9ca3af"
									strokeDasharray="4 4"
									label={{
										value: translate('admin.revenueToday'),
										position: 'insideTopRight',
										fontSize: 11,
										fill: '#9ca3af',
									}}
								/>
							)}
							<Bar
								dataKey="earned"
								stackId="money"
								name={finalLabel}
								fill="#10b981"
								radius={[0, 0, 0, 0]}
							/>
							<Bar dataKey="kept" stackId="money" name={keptLabel} fill="#38bdf8" />
							<Bar
								dataKey="expected"
								stackId="money"
								name={expectedLabel}
								fill="#f59e0b"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			) : (
				<div className="flex h-72 items-center justify-center text-sm text-gray-500">
					{translate('admin.revenueNoTours')}
				</div>
			)}
		</section>
	);
}
