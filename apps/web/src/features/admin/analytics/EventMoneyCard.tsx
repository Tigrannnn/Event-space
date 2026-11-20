'use client';

import type { DashboardFlow } from '@event-space/shared';
import { useFormatCurrency } from '@/hooks/format';
import { useLabels } from '@/hooks/labels/useLabels';
import { useTranslation } from '@/hooks/translation';

function percentChange(current: number, previous: number): number | null {
	if (previous === 0) return null;
	return Math.round(((current - previous) / previous) * 100);
}

function Delta({ current, previous }: { current: number; previous: number }) {
	const change = percentChange(current, previous);
	if (change === null) return null;

	return (
		<span
			className={`text-xs font-medium ${
				change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
			}`}
		>
			{change >= 0 ? '+' : ''}
			{change}%
		</span>
	);
}

interface StatProps {
	label: string;
	value: string;
	delta?: { current: number; previous: number };
}

function Stat({ label, value, delta }: StatProps) {
	return (
		<div className="min-w-0 rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
			<p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
			<p className="mt-1 text-lg font-semibold break-words text-gray-900 tabular-nums dark:text-white">{value}</p>
			{delta && <Delta current={delta.current} previous={delta.previous} />}
		</div>
	);
}

export default function EventMoneyCard({ flow, isLoading }: { flow?: DashboardFlow; isLoading: boolean }) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const { PAYMENT_METHOD_LABELS } = useLabels();

	if (isLoading || !flow) {
		return <div className="h-40 animate-pulse rounded-2xl bg-white dark:bg-gray-900" />;
	}

	const { totals, previousTotals, paymentMix } = flow;
	const methods = paymentMix.methods.filter((row) => row.bookings > 0);
	const hasMix = methods.length > 0 || paymentMix.cancelled.bookings > 0;

	return (
		<div className="space-y-3">
			<div className="grid grid-cols-2 gap-2 md:grid-cols-4">
				<Stat
					label={translate('admin.tourMoneyCollected')}
					value={formatCurrency(totals.collected)}
					delta={{ current: totals.collected, previous: previousTotals.collected }}
				/>
				<Stat label={translate('admin.tourMoneyRefunded')} value={formatCurrency(totals.refunded)} />
				<Stat
					label={translate('admin.tourMoneyNet')}
					value={formatCurrency(totals.revenue)}
					delta={{ current: totals.revenue, previous: previousTotals.revenue }}
				/>
				<Stat
					label={translate('admin.bookingsCreated')}
					value={String(totals.bookingsCreated)}
					delta={{ current: totals.bookingsCreated, previous: previousTotals.bookingsCreated }}
				/>
			</div>

			<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
				<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
					{translate('admin.paymentMix')}
				</p>
				<p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{translate('admin.tourMoneyMixHint')}</p>

				{!hasMix ? (
					<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{translate('admin.paymentMixFlowEmpty')}</p>
				) : (
					<ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
						{methods.map((row) => (
							<li key={row.method} className="flex items-start justify-between gap-3 py-2">
								<div className="min-w-0">
									<p className="text-sm text-gray-900 dark:text-white">{PAYMENT_METHOD_LABELS[row.method]}</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{row.bookings} {translate('admin.bookingsShort')} · {row.guests} {translate('admin.guestsShort')}
									</p>
								</div>
								<span className="shrink-0 text-sm font-semibold text-gray-900 tabular-nums dark:text-white">
									{formatCurrency(row.amount)}
								</span>
							</li>
						))}
						{paymentMix.cancelled.bookings > 0 && (
							<li className="flex items-start justify-between gap-3 py-2 text-gray-500 dark:text-gray-400">
								<div className="min-w-0">
									<p className="text-sm">{translate('admin.paymentMixFlowCancelled')}</p>
									<p className="text-xs">
										{paymentMix.cancelled.bookings} {translate('admin.bookingsShort')}
									</p>
								</div>
								<span className="shrink-0 text-sm tabular-nums">{formatCurrency(paymentMix.cancelled.amount)}</span>
							</li>
						)}
					</ul>
				)}
			</div>
		</div>
	);
}
