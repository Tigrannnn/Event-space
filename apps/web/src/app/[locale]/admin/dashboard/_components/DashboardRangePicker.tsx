'use client';

import { startOfToday, subDays } from 'date-fns';
import { DateRangePicker, formatDateParam, parseDateParam } from '@/components/filters';
import type { DateRangePreset } from '@/components/filters';
import { useTranslation } from '@/hooks/translation';
import { useFormatDate } from '@/hooks/format';
import type { DashboardRange } from './dashboard-range';

interface DashboardRangePickerProps {
	range: DashboardRange;
	onRangeChange: (range: DashboardRange) => void;
}

export default function DashboardRangePicker({ range, onRangeChange }: DashboardRangePickerProps) {
	const translate = useTranslation();
	const { formatDateShort } = useFormatDate();

	const presets: DateRangePreset[] = [
		{
			key: 'today',
			label: translate('filters.today'),
			getRange: () => ({ from: startOfToday(), to: startOfToday() }),
		},
		...[7, 30, 90].map((days) => ({
			key: `last-${days}`,
			label: translate('admin.lastDays', { days }),
			getRange: () => ({ from: subDays(startOfToday(), days - 1), to: startOfToday() }),
		})),
	];

	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<div>
				<h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
					{translate('admin.dashboard')}
				</h1>
				<p className="text-sm text-gray-500">
					{formatDateShort(new Date(`${range.from}T00:00:00`))} —{' '}
					{formatDateShort(new Date(`${range.to}T00:00:00`))}
				</p>
			</div>

			<DateRangePicker
				value={{
					from: parseDateParam(range.from) ?? new Date(),
					to: parseDateParam(range.to) ?? new Date(),
				}}
				onChange={(next) => {
					if (!next) return;
					onRangeChange({ from: formatDateParam(next.from), to: formatDateParam(next.to) });
				}}
				placeholder={translate('admin.period')}
				// Nothing has happened after today, so the future is not selectable.
				disabled={{ after: startOfToday() }}
				presets={presets}
			/>
		</div>
	);
}
