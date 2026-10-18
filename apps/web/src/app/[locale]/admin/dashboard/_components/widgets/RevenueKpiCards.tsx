'use client';

import { DollarSign, Hourglass, Undo2 } from 'lucide-react';
import { toZonedDateKey, type DashboardRevenue } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useFormatCurrency } from '@/hooks/format';

interface RevenueKpiCardsProps {
	revenue?: DashboardRevenue;
	isLoading: boolean;
}

function percentChange(current: number, previous: number): number | null {
	if (previous <= 0) return null;
	return Math.round(((current - previous) / previous) * 100);
}

export default function RevenueKpiCards({ revenue, isLoading }: RevenueKpiCardsProps) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();

	if (isLoading || !revenue) {
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

	const { totals, previousTotals, upcoming } = revenue;
	const startsInFuture = (revenue.points[0]?.date ?? '') > toZonedDateKey(new Date());
	const change = startsInFuture ? null : percentChange(totals.earned, previousTotals.earned);

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div className="rounded-lg border border-gray-500 p-4 shadow-sm sm:p-5">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0 flex-1">
						<p className="text-sm text-gray-500">{translate('admin.revenueEarned')}</p>
						<p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
							{formatCurrency(totals.earned)}
						</p>
						<p className="mt-2 text-xs text-gray-500">
							{translate('admin.revenueEarnedHint', { count: totals.toursFinished })}
							{change !== null && (
								<span
									className={`ml-2 font-medium ${
										change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
									}`}
								>
									{change >= 0 ? '+' : ''}
									{change}% {translate('admin.vsPreviousPeriod')}
								</span>
							)}
						</p>
						{totals.refunded > 0 && (
							<p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
								<Undo2 className="h-3.5 w-3.5" />
								{translate('admin.revenueRefunded')}:{' '}
								<span className="font-medium text-gray-900 dark:text-gray-100">
									{formatCurrency(totals.refunded)}
								</span>
							</p>
						)}
						{totals.corrections > 0 && (
							<p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
								{translate('admin.revenueCorrections')}: −{formatCurrency(totals.corrections)}
							</p>
						)}
					</div>
					<div className="shrink-0 rounded-md border border-gray-500 p-2">
						<DollarSign className="text-primary h-5 w-5" />
					</div>
				</div>
			</div>

			<div className="rounded-lg border border-gray-500 p-4 shadow-sm sm:p-5">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0 flex-1">
						<p className="text-sm text-gray-500">{translate('admin.revenueExpected')}</p>
						<p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
							{formatCurrency(upcoming.expected)}
						</p>
						<p className="mt-2 text-xs text-gray-500">
							{translate('admin.revenueExpectedTours', { count: upcoming.tours })}
						</p>
						<p className="mt-1 text-xs text-gray-500">
							{translate('admin.revenueExpectedInPeriod')}:{' '}
							<span className="font-medium text-gray-900 dark:text-gray-100">
								{formatCurrency(totals.expected)}
							</span>
						</p>
						<p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
							{translate('admin.revenueExpectedHint')}
						</p>
						<p className="mt-3 text-xs text-gray-500">
							{translate('admin.revenueToCollect')}:{' '}
							<span className="font-medium text-gray-900 dark:text-gray-100">
								{formatCurrency(upcoming.toCollectOnSite)}
							</span>
						</p>
					</div>
					<div className="shrink-0 rounded-md border border-gray-500 p-2">
						<Hourglass className="text-primary h-5 w-5" />
					</div>
				</div>
			</div>
		</div>
	);
}
