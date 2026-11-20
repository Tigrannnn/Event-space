'use client';

import type { DashboardFlow } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useLabels } from '@/hooks/labels/useLabels';
import { useFormatCurrency } from '@/hooks/format';

interface FlowPaymentMixWidgetProps {
	flow?: DashboardFlow;
	isLoading: boolean;
}

export default function FlowPaymentMixWidget({ flow, isLoading }: FlowPaymentMixWidgetProps) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const { PAYMENT_METHOD_LABELS } = useLabels();

	if (isLoading || !flow) {
		return (
			<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
				<div className="h-48 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
			</section>
		);
	}

	const { methods, cancelled } = flow.paymentMix;
	const hasBookings = cancelled.bookings > 0 || methods.some((row) => row.bookings > 0);

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="font-semibold text-gray-900 dark:text-gray-100">{translate('admin.paymentMix')}</h2>
			<p className="mb-4 text-sm text-gray-500">{translate('admin.paymentMixFlowHint')}</p>

			{!hasBookings ? (
				<p className="text-sm text-gray-500">{translate('admin.paymentMixFlowEmpty')}</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-left text-xs tracking-wider text-gray-500 uppercase">
								<th className="py-2 font-medium">{translate('admin.paymentMethod')}</th>
								<th className="py-2 text-right font-medium">{translate('admin.bookings')}</th>
								<th className="py-2 text-right font-medium">{translate('admin.guests')}</th>
								<th className="py-2 text-right font-medium">{translate('admin.paymentMixFlowAmount')}</th>
							</tr>
						</thead>
						<tbody>
							{methods.map((row) => (
								<tr key={row.method} className="border-t border-gray-200 dark:border-gray-700">
									<td className="py-2 text-gray-900 dark:text-gray-100">{PAYMENT_METHOD_LABELS[row.method]}</td>
									<td className="py-2 text-right text-gray-700 dark:text-gray-300">{row.bookings}</td>
									<td className="py-2 text-right text-gray-700 dark:text-gray-300">{row.guests}</td>
									<td className="py-2 text-right font-semibold text-gray-900 dark:text-gray-100">
										{formatCurrency(row.amount)}
									</td>
								</tr>
							))}
							{cancelled.bookings > 0 && (
								<tr className="border-t border-gray-200 text-gray-500 dark:border-gray-700">
									<td className="py-2">{translate('admin.paymentMixFlowCancelled')}</td>
									<td className="py-2 text-right">{cancelled.bookings}</td>
									<td className="py-2 text-right">—</td>
									<td className="py-2 text-right font-semibold">{formatCurrency(cancelled.amount)}</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
