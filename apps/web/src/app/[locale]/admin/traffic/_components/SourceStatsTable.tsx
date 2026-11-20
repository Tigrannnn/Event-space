'use client';

import { sourceConversion, type SourceStatsRow } from '@event-space/shared';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/Table';
import StatsRangePicker from '@/features/admin/analytics/StatsRangePicker';
import { useSourceStats } from '@/features/admin/hooks/useAdmin';
import { useFormatCurrency } from '@/hooks/format';
import { useTranslation } from '@/hooks/translation';
import { useSourceLabel } from '@/hooks/labels/useSourceLabel';
import { useUrlFilters } from '@/hooks/urlFilters';
import {
	defaultDashboardRange,
	parseDashboardRange,
	serializeDashboardRange,
} from '../../dashboard/_components/dashboard-range';

type Counts = Omit<SourceStatsRow, 'source'>;

export default function SourceStatsTable() {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const sourceLabel = useSourceLabel();
	const { filters: range, setFilters: setRange } = useUrlFilters({
		parse: parseDashboardRange,
		serialize: serializeDashboardRange,
		empty: defaultDashboardRange,
	});
	const { data, isLoading } = useSourceStats(range.from, range.to);

	const conversion = (row: Counts) => {
		const share = sourceConversion(row);
		return share === null ? '—' : `${Math.round(share * 100)}%`;
	};

	const cells = (row: Counts) => (
		<>
			<TableCell>{row.visitors}</TableCell>
			<TableCell>{row.viewedTours}</TableCell>
			<TableCell>{row.startedBooking}</TableCell>
			<TableCell>{row.bookings}</TableCell>
			<TableCell className="whitespace-nowrap">{formatCurrency(row.amount)}</TableCell>
			<TableCell>{conversion(row)}</TableCell>
		</>
	);

	return (
		<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
			<div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
				<div>
					<h1 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100">
						{translate('admin.traffic')}
					</h1>
					<p className="text-xs text-gray-500 sm:text-sm">{translate('admin.trafficHint')}</p>
				</div>
				<StatsRangePicker value={range} onChange={setRange} />
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="px-3 sm:px-5">{translate('admin.statsSource')}</TableHead>
						<TableHead>{translate('admin.statsVisitors')}</TableHead>
						<TableHead>{translate('admin.statsViewedTours')}</TableHead>
						<TableHead>{translate('admin.statsStartedBooking')}</TableHead>
						<TableHead>{translate('admin.statsBookings')}</TableHead>
						<TableHead>{translate('admin.statsAmount')}</TableHead>
						<TableHead title={translate('admin.statsConversionHint')}>{translate('admin.statsConversion')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading && (
						<TableRow>
							<TableCell colSpan={7} className="px-3 py-8 text-center text-gray-500 sm:px-5">
								…
							</TableCell>
						</TableRow>
					)}
					{data?.rows.map((row) => (
						<TableRow key={row.source?.id ?? 'none'} className={row.source ? undefined : 'text-gray-500'}>
							<TableCell className={row.source ? 'px-3 font-medium sm:px-5' : 'px-3 italic sm:px-5'}>
								{sourceLabel(row)}
							</TableCell>
							{cells(row)}
						</TableRow>
					))}
					{data && (
						<TableRow className="font-semibold">
							<TableCell className="px-3 sm:px-5">{translate('admin.statsTotal')}</TableCell>
							{cells(data.totals)}
						</TableRow>
					)}
				</TableBody>
			</Table>
			<p className="border-t border-gray-300 px-3 py-2 text-xs text-gray-500 sm:px-5 dark:border-gray-700">
				{translate('admin.statsFootnote')}
			</p>
		</div>
	);
}
