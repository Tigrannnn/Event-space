'use client';

import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import type { DashboardExpectedTimeline } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useFormatCurrency, useFormatDate } from '@/hooks/format';
import { toChartDate } from '../chart-utils';
import ChartTooltip from './ChartTooltip';

interface ExpectedTimelineProps {
	timeline?: DashboardExpectedTimeline;
	isLoading: boolean;
}

export default function ExpectedTimeline({ timeline, isLoading }: ExpectedTimelineProps) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const { formatDateShort, formatDateYear } = useFormatDate();

	if (isLoading || !timeline) {
		return (
			<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
				<div className="h-72 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
			</section>
		);
	}

	if (timeline.points.length === 0) return null;

	const hasAnyMoney =
		timeline.opening !== 0 || timeline.points.some((point) => point.expected !== 0);

	const steps = [
		{ label: translate('admin.expectedOpening'), value: timeline.opening, sign: '' },
		{ label: translate('admin.expectedAdded'), value: timeline.totals.added, sign: '+' },
		{ label: translate('admin.expectedCancelled'), value: timeline.totals.cancelled, sign: '−' },
		{ label: translate('admin.expectedSettled'), value: timeline.totals.settled, sign: '−' },
		{ label: translate('admin.expectedClosing'), value: timeline.closing, sign: '=' },
	];

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="font-semibold text-gray-900 dark:text-gray-100">
				{translate('admin.expectedOverTime')}
			</h2>
			<p className="mb-4 text-sm text-gray-500">{translate('admin.expectedOverTimeHint')}</p>

			<dl className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
				{steps.map((step) => (
					<div key={step.label} className="rounded-md border border-gray-500 p-3">
						<dt className="text-xs text-gray-500">{step.label}</dt>
						<dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
							{step.sign}
							{formatCurrency(step.value)}
						</dd>
					</div>
				))}
			</dl>

			{hasAnyMoney ? (
				<div className="h-64 w-full">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={timeline.points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
							<Area
								type="stepAfter"
								dataKey="expected"
								name={translate('admin.revenueExpected')}
								stroke="#f59e0b"
								fill="#f59e0b"
								fillOpacity={0.2}
								strokeWidth={2}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			) : (
				<div className="flex h-64 items-center justify-center text-sm text-gray-500">
					{translate('admin.expectedNothing')}
				</div>
			)}
		</section>
	);
}
