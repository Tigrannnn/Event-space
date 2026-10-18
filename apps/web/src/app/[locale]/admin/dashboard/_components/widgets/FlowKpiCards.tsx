'use client';

import type { ReactNode } from 'react';
import { DollarSign, Ticket, TrendingDown, TrendingUp } from 'lucide-react';
import type { BookingCohort, DashboardFlow } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useFormatCurrency } from '@/hooks/format';
import { useLabels } from '@/hooks/labels/useLabels';
import { BOOKING_STATUS_COLORS } from '../booking-status-colors';

interface FlowKpiCardsProps {
	flow?: DashboardFlow;
	cohort?: BookingCohort;
	isLoading: boolean;
}

/**
 * Percentage change against the previous period of the same length.
 *
 * Returns null when the previous period was empty: "up 100%" from a base of zero reads like
 * growth when it only means "there was nothing before".
 */
function percentChange(current: number, previous: number): number | null {
	if (previous === 0) return null;
	return Math.round(((current - previous) / previous) * 100);
}

function DeltaBadge({ change }: { change: number | null }) {
	const translate = useTranslation();

	if (change === null) {
		return <span className="text-xs text-gray-500">{translate('admin.noPriorData')}</span>;
	}

	const isUp = change >= 0;
	const Icon = isUp ? TrendingUp : TrendingDown;

	return (
		<span
			className={`inline-flex items-center gap-1 text-xs font-medium ${
				isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
			}`}
		>
			<Icon className="h-3.5 w-3.5" />
			{isUp ? '+' : ''}
			{change}% {translate('admin.vsPreviousPeriod')}
		</span>
	);
}

/**
 * What became of the bookings the period created, as a strip under the count.
 *
 * The count alone hides the part that decides what to do about it: "340 bookings" and "340
 * bookings, 90 of them since cancelled" are the same headline and different news. These are the
 * same bookings by their status today, not a second period's worth.
 */
function CohortSplit({ cohort }: { cohort: BookingCohort }) {
	const translate = useTranslation();
	const { BOOKING_STATUS_LABELS } = useLabels();

	const segments = (
		[
			{ key: 'confirmed', label: BOOKING_STATUS_LABELS.CONFIRMED, value: cohort.current.confirmed },
			{ key: 'pending', label: BOOKING_STATUS_LABELS.PENDING, value: cohort.current.pending },
			{ key: 'cancelled', label: BOOKING_STATUS_LABELS.CANCELLED, value: cohort.current.cancelled },
		] as const
	).filter((segment) => segment.value > 0);

	if (cohort.current.total === 0) return null;

	return (
		<div className="mt-4">
			<p className="text-xs text-gray-500">{translate('admin.cohortToday')}</p>
			<div className="mt-2 flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
				{segments.map((segment) => (
					<div
						key={segment.key}
						style={{
							width: `${(segment.value / cohort.current.total) * 100}%`,
							backgroundColor: BOOKING_STATUS_COLORS[segment.key],
						}}
					/>
				))}
			</div>
			<ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
				{segments.map((segment) => (
					<li key={segment.key} className="flex items-center gap-1.5">
						<span
							className="h-2 w-2 shrink-0 rounded-full"
							style={{ backgroundColor: BOOKING_STATUS_COLORS[segment.key] }}
						/>
						{segment.label}
						<span className="font-medium text-gray-900 dark:text-gray-100">
							{segment.value.toLocaleString()}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

interface KpiCardProps {
	label: string;
	value: string;
	change: number | null;
	icon: typeof DollarSign;
	footer?: ReactNode;
}

function KpiCard({ label, value, change, icon: Icon, footer }: KpiCardProps) {
	return (
		<div className="rounded-lg border border-gray-500 p-4 shadow-sm sm:p-5">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					<p className="text-sm text-gray-500">{label}</p>
					<p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
					<p className="mt-2">
						<DeltaBadge change={change} />
					</p>
					{footer}
				</div>
				<div className="shrink-0 rounded-md border border-gray-500 p-2">
					<Icon className="text-primary h-5 w-5" />
				</div>
			</div>
		</div>
	);
}

function MoneySplit({ collected, refunded }: { collected: number; refunded: number }) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();

	const rows = [
		{ label: translate('admin.revenueReceived'), value: collected },
		{ label: translate('admin.revenueRefunded'), value: refunded },
	];

	return (
		<dl className="mt-4 space-y-1 text-xs text-gray-500">
			{rows.map((row) => (
				<div key={row.label} className="flex items-center justify-between gap-4">
					<dt>{row.label}</dt>
					<dd className="font-medium text-gray-900 dark:text-gray-100">
						{formatCurrency(row.value)}
					</dd>
				</div>
			))}
		</dl>
	);
}

export function BookingsCreatedCard({
	flow,
	cohort,
	isLoading,
}: {
	flow?: DashboardFlow;
	cohort?: BookingCohort;
	isLoading: boolean;
}) {
	const translate = useTranslation();

	if (isLoading || !flow) {
		return (
			<div className="h-32 animate-pulse rounded-lg border border-gray-500 bg-gray-100 dark:bg-gray-800" />
		);
	}

	return (
		<KpiCard
			label={translate('admin.bookingsCreated')}
			value={flow.totals.bookingsCreated.toLocaleString()}
			change={percentChange(flow.totals.bookingsCreated, flow.previousTotals.bookingsCreated)}
			icon={Ticket}
			footer={cohort ? <CohortSplit cohort={cohort} /> : null}
		/>
	);
}

export default function FlowKpiCards({ flow, cohort, isLoading }: FlowKpiCardsProps) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();

	if (isLoading || !flow) {
		return (
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				{[0, 1].map((key) => (
					<div
						key={key}
						className="h-32 animate-pulse rounded-lg border border-gray-500 bg-gray-100 dark:bg-gray-800"
					/>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<KpiCard
				label={translate('admin.revenueInPeriod')}
				value={formatCurrency(flow.totals.revenue)}
				change={percentChange(flow.totals.revenue, flow.previousTotals.revenue)}
				icon={DollarSign}
				footer={<MoneySplit collected={flow.totals.collected} refunded={flow.totals.refunded} />}
			/>
			<BookingsCreatedCard flow={flow} cohort={cohort} isLoading={false} />
		</div>
	);
}
