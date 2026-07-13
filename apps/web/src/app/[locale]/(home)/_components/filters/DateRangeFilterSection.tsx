'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, endOfMonth, startOfMonth, startOfToday } from 'date-fns';
import { useTranslation } from '@/hooks/translation';
import { useFormatDate } from '@/hooks/format';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { FilterTriggerButton } from './FilterTriggerButton';
import type { DateRangeFilter, EventsFiltersState } from './types';

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
	const { formatDateShort } = useFormatDate();
	const [open, setOpen] = useState(false);
	const [resolvedMonths, setResolvedMonths] = useState(numberOfMonths);

	useEffect(() => {
		if (variant === 'inline') {
			setResolvedMonths(numberOfMonths);
			return;
		}

		const mediaQuery = window.matchMedia('(min-width: 768px)');
		const updateMonths = () => setResolvedMonths(mediaQuery.matches ? 2 : 1);
		updateMonths();
		mediaQuery.addEventListener('change', updateMonths);
		return () => mediaQuery.removeEventListener('change', updateMonths);
	}, [numberOfMonths, variant]);

	const selectedRange: DateRange | undefined = filters.dateRange
		? { from: filters.dateRange.from, to: filters.dateRange.to }
		: undefined;

	const label = useMemo(() => {
		if (!filters.dateRange) return translate('filters.when');
		return `${formatDateShort(filters.dateRange.from)} — ${formatDateShort(filters.dateRange.to)}`;
	}, [filters.dateRange, formatDateShort, translate]);

	const applyRange = (range: DateRangeFilter | null) => {
		onFiltersChange({ ...filters, dateRange: range });
	};

	const handleSelect = (range: DateRange | undefined) => {
		if (range?.from && range?.to) {
			applyRange({ from: range.from, to: range.to });
			if (variant === 'popover') {
				setOpen(false);
			}
		}
	};

	const presets = [
		{
			key: 'today',
			label: translate('filters.today'),
			getRange: (): DateRangeFilter => {
				const today = startOfToday();
				return { from: today, to: today };
			},
		},
		{
			key: 'weekend',
			label: translate('filters.thisWeekend'),
			getRange: (): DateRangeFilter => {
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
			getRange: (): DateRangeFilter => {
				const today = startOfToday();
				return { from: startOfMonth(today), to: endOfMonth(today) };
			},
		},
	];

	const calendarContent = (
		<>
			<div className="mb-3 flex flex-wrap gap-2">
				{presets.map((preset) => (
					<Button
						key={preset.key}
						type="button"
						variant="outline"
						size="sm"
						className="h-8 rounded-full"
						onClick={() => {
							applyRange(preset.getRange());
							if (variant === 'popover') {
								setOpen(false);
							}
						}}
					>
						{preset.label}
					</Button>
				))}
			</div>
			<Calendar
				mode="range"
				selected={selectedRange}
				onSelect={handleSelect}
				numberOfMonths={resolvedMonths}
				disabled={{ before: startOfToday() }}
			/>
		</>
	);

	if (variant === 'inline') {
		return (
			<div className="rounded-3xl border border-gray-200/80 bg-white p-3 shadow-sm dark:border-gray-700/70 dark:bg-gray-800/80">
				{calendarContent}
			</div>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<FilterTriggerButton isActive={Boolean(filters.dateRange)}>
					<CalendarIcon className="size-4 text-primary/80" />
					{label}
				</FilterTriggerButton>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-auto rounded-3xl p-3 text-foreground shadow-lg dark:text-white">
				{calendarContent}
			</PopoverContent>
		</Popover>
	);
}
