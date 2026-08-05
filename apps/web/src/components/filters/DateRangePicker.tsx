'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import type { DateRange, Matcher } from 'react-day-picker';
import { useFormatDate } from '@/hooks/format';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover';
import { Calendar } from '@/components/ui/primitives/calendar';
import { Button } from '@/components/ui/primitives/button';
import { FilterTriggerButton } from './FilterTriggerButton';
import type { DateRangePreset, DateRangeValue } from './types';

interface DateRangePickerProps {
	value: DateRangeValue | null;
	onChange: (value: DateRangeValue | null) => void;
	/** Text shown on the trigger while no range is selected. */
	placeholder: string;
	/**
	 * Which days are selectable. The storefront only books forward (`{ before: today }`), the
	 * admin panel only looks backward — so this stays a prop rather than a built-in assumption.
	 */
	disabled?: Matcher | Matcher[];
	presets?: DateRangePreset[];
	numberOfMonths?: number;
	variant?: 'popover' | 'inline';
}

export function DateRangePicker({
	value,
	onChange,
	placeholder,
	disabled,
	presets = [],
	numberOfMonths = 2,
	variant = 'popover',
}: DateRangePickerProps) {
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

	const selectedRange: DateRange | undefined = value
		? { from: value.from, to: value.to }
		: undefined;

	const label = useMemo(() => {
		if (!value) return placeholder;
		return `${formatDateShort(value.from)} — ${formatDateShort(value.to)}`;
	}, [value, formatDateShort, placeholder]);

	const handleSelect = (range: DateRange | undefined) => {
		if (range?.from && range?.to) {
			onChange({ from: range.from, to: range.to });
			if (variant === 'popover') setOpen(false);
		}
	};

	const calendarContent = (
		<>
			{presets.length > 0 && (
				<div className="mb-3 flex flex-wrap gap-2">
					{presets.map((preset) => (
						<Button
							key={preset.key}
							type="button"
							variant="outline"
							size="sm"
							className="h-8 rounded-full"
							onClick={() => {
								onChange(preset.getRange());
								if (variant === 'popover') setOpen(false);
							}}
						>
							{preset.label}
						</Button>
					))}
				</div>
			)}
			<Calendar
				mode="range"
				selected={selectedRange}
				onSelect={handleSelect}
				numberOfMonths={resolvedMonths}
				disabled={disabled}
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
				<FilterTriggerButton isActive={Boolean(value)}>
					<div className="flex items-center gap-2">
						<CalendarIcon className="text-primary/80 size-4 shrink-0" />
						<span className="truncate whitespace-nowrap">{label}</span>
					</div>
				</FilterTriggerButton>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="text-foreground w-auto rounded-3xl p-3 shadow-lg dark:text-white"
			>
				{calendarContent}
			</PopoverContent>
		</Popover>
	);
}
