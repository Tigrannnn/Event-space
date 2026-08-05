'use client';

import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import type { BookingStatePoint, BookingStatusCounts, DashboardStats } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useFormatDate } from '@/hooks/format';
import { useLabels } from '@/hooks/labels/useLabels';
import { toChartDate } from '../chart-utils';
import { BOOKING_STATUS_COLORS } from '../booking-status-colors';
import ChartTooltip from './ChartTooltip';

interface BookingStateWidgetProps {
	stats: DashboardStats;
	history?: BookingStatePoint[];
	/** A single day is a number, not a trend, so today is shown as live counts. */
	showLive: boolean;
	isLoading: boolean;
}

/**
 * How bookings are distributed across statuses — either right now, or day by day over the
 * selected range.
 *
 * The historical view is derived from the booking status history, which stores the period each
 * booking spent in each status. Asking it about March returns March's confirmations even if half
 * of them were refunded since; asking the bookings table would return only what survived.
 *
 * One caveat on old days: bookings that predate the history were seeded with a single period
 * running from their creation, so before that point the chart shows each booking holding the
 * status it holds today. The transitions it never saw are not recoverable.
 */
export default function BookingStateWidget({
	stats,
	history,
	showLive,
	isLoading,
}: BookingStateWidgetProps) {
	const translate = useTranslation();
	const { formatDateShort, formatDateYear } = useFormatDate();
	const { BOOKING_STATUS_LABELS } = useLabels();

	const liveCounts: BookingStatusCounts = {
		total: stats.totalBookings,
		pending: stats.pendingBookings,
		confirmed: stats.confirmedBookings,
		cancelled: stats.cancelledBookings,
		// Not in the live stats payload yet — the remainder is what the other statuses don't cover.
		expired: Math.max(
			0,
			stats.totalBookings -
				stats.pendingBookings -
				stats.confirmedBookings -
				stats.cancelledBookings,
		),
	};

	const chartData = history?.map((point) => ({ date: point.date, ...point.bookings })) ?? [];

	// Every day of the range comes back, quiet days included, so an emptily-plotted chart means
	// there were no bookings at all rather than a hole in the data.
	const hasBookings = chartData.some((point) => point.total > 0);

	const rows = [
		{ key: 'confirmed', label: BOOKING_STATUS_LABELS.CONFIRMED, value: liveCounts.confirmed },
		{ key: 'pending', label: BOOKING_STATUS_LABELS.PENDING, value: liveCounts.pending },
		{ key: 'cancelled', label: BOOKING_STATUS_LABELS.CANCELLED, value: liveCounts.cancelled },
		{ key: 'expired', label: BOOKING_STATUS_LABELS.EXPIRED, value: liveCounts.expired },
	] as const;

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="font-semibold text-gray-900 dark:text-gray-100">
				{translate('admin.bookingStatus')}
			</h2>
			<p className="mb-4 text-sm text-gray-500">
				{showLive ? translate('admin.rightNow') : translate('admin.overSelectedPeriodHint')}
			</p>

			{showLive ? (
				<div className="space-y-3">
					<p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						{liveCounts.total.toLocaleString()}
					</p>
					{rows.map((row) => (
						<div key={row.key}>
							<div className="mb-1 flex items-center justify-between text-sm">
								<span className="text-gray-500">{row.label}</span>
								<span className="font-medium">{row.value.toLocaleString()}</span>
							</div>
							<div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
								<div
									className="h-full rounded-full"
									style={{
										width: `${liveCounts.total ? (row.value / liveCounts.total) * 100 : 0}%`,
										backgroundColor: BOOKING_STATUS_COLORS[row.key],
									}}
								/>
							</div>
						</div>
					))}
				</div>
			) : isLoading ? (
				<div className="h-64 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
			) : !hasBookings ? (
				<div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
					<p className="text-sm text-gray-500">{translate('admin.noBookingsForRange')}</p>
					<p className="max-w-xs text-xs text-gray-400">
						{translate('admin.noBookingsForRangeHint')}
					</p>
				</div>
			) : (
				<div className="h-64 w-full">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart
							data={chartData}
							margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
						>
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
							<YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
							<Tooltip
								content={
									<ChartTooltip
										formatLabel={(label) => {
											const date = toChartDate(label);
											return date ? formatDateYear(date) : String(label ?? '');
										}}
									/>
								}
							/>
							<Legend />
							{rows.map((row) => (
								<Area
									key={row.key}
									type="monotone"
									dataKey={row.key}
									name={row.label}
									stackId="bookings"
									stroke={BOOKING_STATUS_COLORS[row.key]}
									fill={BOOKING_STATUS_COLORS[row.key]}
									fillOpacity={0.65}
								/>
							))}
						</AreaChart>
					</ResponsiveContainer>
				</div>
			)}
		</section>
	);
}
