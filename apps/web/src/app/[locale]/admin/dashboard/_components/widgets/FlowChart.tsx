'use client';

import {
	Bar,
	CartesianGrid,
	ComposedChart,
	Legend,
	Line,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import type { DashboardFlow } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useFormatCurrency, useFormatDate } from '@/hooks/format';
import { toChartDate } from '../chart-utils';
import ChartTooltip from './ChartTooltip';

interface FlowChartProps {
	flow?: DashboardFlow;
	isLoading: boolean;
}

/**
 * Bookings and revenue on one chart, sharing an x-axis.
 *
 * Combined rather than side by side so the relationship is visible: revenue climbing while
 * booking count is flat means the average order grew, which two separate charts would hide.
 */
export default function FlowChart({ flow, isLoading }: FlowChartProps) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const { formatDateShort, formatDateYear } = useFormatDate();

	if (isLoading || !flow) {
		return (
			<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
				<div className="h-72 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
			</section>
		);
	}

	const hasAnyActivity = flow.points.some((point) => point.bookingsCreated > 0);

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="font-semibold text-gray-900 dark:text-gray-100">
				{translate('admin.activityOverTime')}
			</h2>
			<p className="mb-4 text-sm text-gray-500">{translate('admin.activityOverTimeHint')}</p>

			{hasAnyActivity ? (
				<div className="h-72 w-full">
					<ResponsiveContainer width="100%" height="100%">
						<ComposedChart data={flow.points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
							<YAxis yAxisId="bookings" tick={{ fontSize: 12 }} allowDecimals={false} />
							<YAxis yAxisId="revenue" orientation="right" tick={{ fontSize: 12 }} width={80} />
							<Tooltip
								content={
									<ChartTooltip
										// The tooltip carries the full date including the year; the axis below is
										// short on space and shows only day and month.
										formatLabel={(label) => {
											const date = toChartDate(label);
											return date ? formatDateYear(date) : String(label ?? '');
										}}
										formatValue={(value, name) =>
											name === translate('admin.revenue')
												? formatCurrency(value)
												: value.toLocaleString()
										}
									/>
								}
							/>
							<Legend />
							<Bar
								yAxisId="bookings"
								dataKey="bookingsCreated"
								name={translate('admin.bookingsCreated')}
								fill="var(--color-primary)"
								radius={[4, 4, 0, 0]}
							/>
							<Line
								yAxisId="revenue"
								type="monotone"
								dataKey="revenue"
								name={translate('admin.revenue')}
								stroke="#10b981"
								strokeWidth={2}
								dot={false}
							/>
						</ComposedChart>
					</ResponsiveContainer>
				</div>
			) : (
				<div className="flex h-72 items-center justify-center text-sm text-gray-500">
					{translate('admin.noActivityInPeriod')}
				</div>
			)}
		</section>
	);
}
