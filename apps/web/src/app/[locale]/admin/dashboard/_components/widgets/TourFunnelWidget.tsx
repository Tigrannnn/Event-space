'use client';

import { useTourFunnel } from '@/features/admin/hooks/useAdmin';
import { percent, tourTitle } from '@/features/admin/analytics/tourFunnel';
import { useTranslation } from '@/hooks/translation';

interface TourFunnelWidgetProps {
	from: string;
	to: string;
}

export default function TourFunnelWidget({ from, to }: TourFunnelWidgetProps) {
	const translate = useTranslation();
	const { data: rows, isLoading } = useTourFunnel(from, to);

	if (isLoading || !rows) {
		return (
			<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
				<div className="h-48 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
			</section>
		);
	}

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<h2 className="font-semibold text-gray-900 dark:text-gray-100">{translate('admin.tourFunnel')}</h2>
			<p className="mb-4 text-sm text-gray-500">{translate('admin.tourFunnelHint')}</p>

			{rows.length === 0 ? (
				<p className="text-sm text-gray-500">{translate('admin.tourFunnelEmpty')}</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-left text-xs tracking-wider text-gray-500 uppercase">
								<th className="py-2 font-medium">{translate('admin.event')}</th>
								<th className="py-2 text-right font-medium">{translate('admin.tourViews')}</th>
								<th className="py-2 text-right font-medium">{translate('admin.tourFavorites')}</th>
								<th className="py-2 text-right font-medium">{translate('admin.tourStarted')}</th>
								<th className="py-2 text-right font-medium">{translate('admin.tourBooked')}</th>
								<th className="py-2 text-right font-medium">{translate('admin.sourceConversion')}</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr key={row.eventId} className="border-t border-gray-200 dark:border-gray-700">
									<td className="max-w-[16rem] truncate py-2 text-gray-900 dark:text-gray-100">
										{tourTitle(row, translate.locale)}
									</td>
									<td className="py-2 text-right text-gray-700 dark:text-gray-300">{row.views}</td>
									<td className="py-2 text-right text-gray-700 dark:text-gray-300">{row.favorites}</td>
									<td className="py-2 text-right text-gray-700 dark:text-gray-300">{row.started}</td>
									<td className="py-2 text-right font-semibold text-gray-900 dark:text-gray-100">{row.booked}</td>
									<td className="py-2 text-right text-gray-700 dark:text-gray-300">{percent(row.booked, row.views)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
