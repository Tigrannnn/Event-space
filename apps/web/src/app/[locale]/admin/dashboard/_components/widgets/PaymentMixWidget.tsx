'use client';

import type { DashboardPaymentMethodStat, DashboardRevenue } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useLabels } from '@/hooks/labels/useLabels';
import { useFormatCurrency } from '@/hooks/format';

interface PaymentMixWidgetProps {
	revenue?: DashboardRevenue;
	isLoading: boolean;
}

function share(part: number, whole: number): string {
	if (whole <= 0) return '0%';
	return `${Math.round((part / whole) * 100)}%`;
}

export default function PaymentMixWidget({ revenue, isLoading }: PaymentMixWidgetProps) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const { PAYMENT_METHOD_LABELS } = useLabels();

	if (isLoading || !revenue) {
		return (
			<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
				<div className="h-48 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
			</section>
		);
	}

	const { methods, cancelled } = revenue.paymentMix;
	const onArrival = methods.find((row) => row.method === 'PAY_ON_ARRIVAL');
	const prepaid = methods.filter((row) => row.method !== 'PAY_ON_ARRIVAL');
	const prepaidNoShow = prepaid.reduce(
		(sum, row) => ({
			bookings: sum.bookings + row.noShowBookings,
			guests: sum.guests + row.noShowGuests,
		}),
		{ bookings: 0, guests: 0 },
	);

	const hasBookings = methods.some((row: DashboardPaymentMethodStat) => row.bookings > 0);

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="font-semibold text-gray-900 dark:text-gray-100">
				{translate('admin.paymentMix')}
			</h2>
			<p className="mb-4 text-sm text-gray-500">{translate('admin.paymentMixHint')}</p>

			{!hasBookings ? (
				<p className="text-sm text-gray-500">{translate('admin.paymentMixEmpty')}</p>
			) : (
				<>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="text-left text-xs tracking-wider text-gray-500 uppercase">
									<th className="py-2 font-medium">{translate('admin.paymentMethod')}</th>
									<th className="py-2 text-right font-medium">{translate('admin.bookings')}</th>
									<th className="py-2 text-right font-medium">{translate('admin.guests')}</th>
									<th className="py-2 text-right font-medium">{translate('admin.revenueEarned')}</th>
								</tr>
							</thead>
							<tbody>
								{methods.map((row) => (
									<tr key={row.method} className="border-t border-gray-200 dark:border-gray-700">
										<td className="py-2 text-gray-900 dark:text-gray-100">
											{PAYMENT_METHOD_LABELS[row.method]}
										</td>
										<td className="py-2 text-right text-gray-700 dark:text-gray-300">
											{row.bookings}
										</td>
										<td className="py-2 text-right text-gray-700 dark:text-gray-300">{row.guests}</td>
										<td className="py-2 text-right font-semibold text-gray-900 dark:text-gray-100">
											{formatCurrency(row.earned)}
										</td>
									</tr>
								))}
								{cancelled.bookings > 0 && (
									<tr className="border-t border-gray-200 text-gray-500 dark:border-gray-700">
										<td className="py-2">{translate('admin.paymentMixCancelled')}</td>
										<td className="py-2 text-right">{cancelled.bookings}</td>
										<td className="py-2 text-right">—</td>
										<td className="py-2 text-right font-semibold">
											{formatCurrency(cancelled.earned)}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{onArrival && onArrival.finishedBookings > 0 && (
						<div className="mt-5 space-y-2 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
							<p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
								{translate('admin.onArrivalAttendance')}
							</p>

							<div className="flex flex-wrap items-baseline gap-x-2 text-sm">
								<span className="text-gray-500">{translate('admin.onArrivalPaid')}:</span>
								<span className="font-semibold text-emerald-600 dark:text-emerald-400">
									{onArrival.finishedBookings - onArrival.noShowBookings}{' '}
									{translate('admin.bookingsShort')}
								</span>
								<span className="text-gray-500">
									· {onArrival.finishedGuests - onArrival.noShowGuests}{' '}
									{translate('admin.guestsShort')} · {formatCurrency(onArrival.earned)}
								</span>
							</div>

							<div className="flex flex-wrap items-baseline gap-x-2 text-sm">
								<span className="text-gray-500">{translate('admin.onArrivalNoShow')}:</span>
								<span className="font-semibold text-red-600 dark:text-red-400">
									{onArrival.noShowBookings} {translate('admin.bookingsShort')}
								</span>
								<span className="text-gray-500">
									· {onArrival.noShowGuests} {translate('admin.guestsShort')} ·{' '}
									{share(onArrival.noShowBookings, onArrival.finishedBookings)}
								</span>
								{onArrival.noShowAmount > 0 && (
									<span className="font-semibold text-red-600 dark:text-red-400">
										· {translate('admin.onArrivalLost')} {formatCurrency(onArrival.noShowAmount)}
									</span>
								)}
							</div>
						</div>
					)}

					{prepaidNoShow.bookings > 0 && (
						<p className="mt-3 text-xs text-gray-500">
							{translate('admin.prepaidNoShow', {
								bookings: prepaidNoShow.bookings,
								guests: prepaidNoShow.guests,
							})}
						</p>
					)}
				</>
			)}
		</section>
	);
}
