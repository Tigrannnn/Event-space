'use client';

import { addDays, endOfMonth, startOfMonth, startOfToday } from 'date-fns';
import { useTranslation } from '@/hooks/translation';
import { DateRangePicker, type DateRangePreset } from '@/components/filters';
import type { EventsFiltersState } from './types';

interface DateRangeFilterSectionProps {
	filters: EventsFiltersState;
	onFiltersChange: (filters: EventsFiltersState) => void;
	numberOfMonths?: number;
	variant?: 'popover' | 'inline';
}

export function DateRangeFilterSection({
	filters,
	onFiltersChange,
	numberOfMonths = 2,
	variant = 'popover',
}: DateRangeFilterSectionProps) {
	const translate = useTranslation();

	const presets: DateRangePreset[] = [
		{
			key: 'today',
			label: translate('filters.today'),
			getRange: () => {
				const today = startOfToday();
				return { from: today, to: today };
			},
		},
		{
			key: 'weekend',
			label: translate('filters.thisWeekend'),
			getRange: () => {
				const today = startOfToday();
				const day = today.getDay();
				if (day === 6) return { from: today, to: addDays(today, 1) };
				if (day === 0) return { from: addDays(today, -1), to: today };
				const saturday = addDays(today, 6 - day);
				return { from: saturday, to: addDays(saturday, 1) };
			},
		},
		{
			key: 'month',
			label: translate('filters.thisMonth'),
			getRange: () => {
				const today = startOfToday();
				return { from: startOfMonth(today), to: endOfMonth(today) };
			},
		},
	];

	return (
		<DateRangePicker
			value={filters.dateRange}
			onChange={(dateRange) => onFiltersChange({ ...filters, dateRange })}
			placeholder={translate('filters.when')}
			// Tours can only be booked forward.
			disabled={{ before: startOfToday() }}
			presets={presets}
			numberOfMonths={numberOfMonths}
			variant={variant}
		/>
	);
}
