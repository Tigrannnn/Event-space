'use client';

import { useTourRevenue } from '@/features/admin/hooks/useAdmin';
import { useFormatCurrency, useFormatDate } from '@/hooks/format';
import { useTranslation } from '@/hooks/translation';
import type { StatsRange } from './statsRange';

export default function EventRevenueCard({ eventId, range }: { eventId: string; range: StatsRange }) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const { formatDateTime } = useFormatDate();
	const { data, isLoading } = useTourRevenue(eventId, range.from, range.to);

	return (
		<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
			<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
				{translate('admin.tourEarned')}
			</p>
			<p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
				{isLoading || !data ? '…' : formatCurrency(data.earned)}
			</p>

			{data && data.upcoming.dates > 0 && (
				<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
					{translate('admin.tourAhead', {
						dates: data.upcoming.dates,
						expected: formatCurrency(data.upcoming.expected),
					})}
					{data.upcoming.toCollectOnSite > 0 &&
						` · ${translate('admin.tourOnSite', { amount: formatCurrency(data.upcoming.toCollectOnSite) })}`}
				</p>
			)}

			{data && (
				<div className="mt-3 border-t border-gray-200 pt-2 dark:border-gray-700">
					<p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{translate('admin.tourByDate')}</p>
					{data.dates.length === 0 ? (
						<p className="text-sm text-gray-500 dark:text-gray-400">{translate('admin.tourDatesEmpty')}</p>
					) : (
						<ul className="max-h-64 space-y-1 overflow-y-auto pr-1 text-sm">
							{data.dates.map((row) => (
								<li key={row.occurrenceId} className="flex items-baseline justify-between gap-3">
									<span className="min-w-0 truncate text-gray-700 dark:text-gray-200">
										{formatDateTime(row.date)}
										<span className="text-gray-500 dark:text-gray-400">
											{' '}
											· {row.guests} {translate('admin.guestsShort')}
										</span>
									</span>
									{row.finished ? (
										<span className="shrink-0 font-medium text-gray-900 tabular-nums dark:text-white">
											{formatCurrency(row.earned)}
										</span>
									) : (
										<span className="shrink-0 text-gray-500 tabular-nums dark:text-gray-400">
											{translate('admin.tourExpectedShort')} {formatCurrency(row.expected + row.toCollectOnSite)}
										</span>
									)}
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
