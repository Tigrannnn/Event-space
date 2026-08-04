'use client';

import { DollarSign, Ticket, TrendingDown, TrendingUp } from 'lucide-react';
import type { DashboardFlow } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useFormatCurrency } from '@/hooks/format';

interface FlowKpiCardsProps {
	flow?: DashboardFlow;
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

export default function FlowKpiCards({ flow, isLoading }: FlowKpiCardsProps) {
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

	const cards = [
		{
			label: translate('admin.revenueInPeriod'),
			value: formatCurrency(flow.totals.revenue),
			change: percentChange(flow.totals.revenue, flow.previousTotals.revenue),
			icon: DollarSign,
		},
		{
			label: translate('admin.bookingsCreated'),
			value: flow.totals.bookingsCreated.toLocaleString(),
			change: percentChange(flow.totals.bookingsCreated, flow.previousTotals.bookingsCreated),
			icon: Ticket,
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			{cards.map((card) => {
				const Icon = card.icon;

				return (
					<div key={card.label} className="rounded-lg border border-gray-500 p-4 shadow-sm sm:p-5">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<p className="text-sm text-gray-500">{card.label}</p>
								<p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
									{card.value}
								</p>
								<p className="mt-2">
									<DeltaBadge change={card.change} />
								</p>
							</div>
							<div className="shrink-0 rounded-md border border-gray-500 p-2">
								<Icon className="text-primary h-5 w-5" />
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
