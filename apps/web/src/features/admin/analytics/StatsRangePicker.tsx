'use client';

import { parseISO, startOfToday, subDays } from 'date-fns';
import { DateRangePicker, formatDateParam, parseDateParam } from '@/components/filters';
import type { DateRangePreset } from '@/components/filters';
import { useTranslation } from '@/hooks/translation';
import { STATS_ALL_TIME_FROM, type StatsRange } from './statsRange';

interface StatsRangePickerProps {
	value: StatsRange;
	onChange: (range: StatsRange) => void;
}

export default function StatsRangePicker({ value, onChange }: StatsRangePickerProps) {
	const translate = useTranslation();

	const presets: DateRangePreset[] = [
		...[7, 30, 90].map((days) => ({
			key: `last-${days}`,
			label: translate('admin.lastDays', { days }),
			getRange: () => ({ from: subDays(startOfToday(), days - 1), to: startOfToday() }),
		})),
		{
			key: 'all-time',
			label: translate('admin.allTime'),
			getRange: () => ({ from: parseISO(STATS_ALL_TIME_FROM), to: startOfToday() }),
		},
	];

	return (
		<DateRangePicker
			value={{
				from: parseDateParam(value.from) ?? new Date(),
				to: parseDateParam(value.to) ?? new Date(),
			}}
			onChange={(next) => {
				if (!next) return;
				onChange({ from: formatDateParam(next.from), to: formatDateParam(next.to) });
			}}
			placeholder={translate('admin.period')}
			presets={presets}
			withActions
		/>
	);
}
