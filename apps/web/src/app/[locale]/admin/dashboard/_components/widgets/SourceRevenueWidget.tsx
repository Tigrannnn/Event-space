'use client';

import type { SourceRevenueRow } from '@event-space/shared';
import { useRevenueBySource } from '@/features/admin/hooks/useAdmin';
import { useFormatCurrency } from '@/hooks/format';
import { useTranslation } from '@/hooks/translation';

interface SourceRevenueWidgetProps {
	from: string;
	to: string;
}

function share(part: number, whole: number): string {
	if (whole <= 0) return '0%';
	return `${Math.round((part / whole) * 100)}%`;
}

export default function SourceRevenueWidget({ from, to }: SourceRevenueWidgetProps) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const { data: rows, isLoading } = useRevenueBySource(from, to);

	if (isLoading || !rows) {
		return (
			<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
				<div className="h-48 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
			</section>
		);
	}

	const label = (row: SourceRevenueRow) => {
		if (row.name) return row.name;
		if (row.ref) return translate('admin.sourceUnknownRef', { ref: row.ref });
		return translate('admin.sourceUnspecified');
	};

	const totalAmount = rows.reduce((sum, row) => sum + row.totals.amount, 0);

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="font-semibold text-gray-900 dark:text-gray-100">{translate('admin.revenueBySource')}</h2>
			<p className="mb-4 text-sm text-gray-500">{translate('admin.revenueBySourceHint')}</p>

			{rows.length === 0 ? (
				<p className="text-sm text-gray-500">{translate('admin.revenueBySourceEmpty')}</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-left text-xs tracking-wider text-gray-500 uppercase">
								<th className="py-2 font-medium">{translate('admin.bookingSource')}</th>
								<th className="py-2 text-right font-medium">{translate('admin.bookings')}</th>
								<th className="py-2 text-right font-medium">{translate('admin.guests')}</th>
								<th className="py-2 text-right font-medium">{translate('admin.sourceAmount')}</th>
								<th className="py-2 text-right font-medium">{translate('admin.sourcePaid')}</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr
									key={row.sourceId ?? row.ref ?? 'none'}
									className={`border-t border-gray-200 dark:border-gray-700 ${row.sourceId ? '' : 'text-gray-500'}`}
								>
									<td className="py-2 text-gray-900 dark:text-gray-100">{label(row)}</td>
									<td className="py-2 text-right text-gray-700 dark:text-gray-300">{row.totals.bookings}</td>
									<td className="py-2 text-right text-gray-700 dark:text-gray-300">{row.totals.guests}</td>
									<td className="py-2 text-right whitespace-nowrap text-gray-900 dark:text-gray-100">
										<span className="font-semibold">{formatCurrency(row.totals.amount)}</span>
										<span className="ml-1 text-xs text-gray-500">{share(row.totals.amount, totalAmount)}</span>
									</td>
									<td className="py-2 text-right whitespace-nowrap text-gray-700 dark:text-gray-300">
										{formatCurrency(row.totals.paid)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
