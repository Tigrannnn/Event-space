'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import type { DateRange, Matcher } from 'react-day-picker';
import { useFormatDate } from '@/hooks/format';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover';
import { Calendar } from '@/components/ui/primitives/calendar';
import { Button } from '@/components/ui/primitives/button';
import { FilterTriggerButton } from './FilterTriggerButton';
import { FilterPopoverActions } from './FilterPopoverActions';
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
	/**
	 * Hold the picked range back until an explicit apply, and close on it.
	 *
	 * Off by default: the admin tables let a picked range fire straight away, and that is the
	 * quicker feel when you are scanning a list. The storefront opts in, where a filter changing
	 * under you mid-selection is more jarring than an extra click.
	 */
	withActions?: boolean;
}

export function DateRangePicker({
	value,
	onChange,
	placeholder,
	disabled,
	presets = [],
	numberOfMonths = 2,
	variant = 'popover',
	withActions = false,
}: DateRangePickerProps) {
	const { formatDateShort } = useFormatDate();
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState<DateRangeValue | null>(value);
	const [resolvedMonths, setResolvedMonths] = useState(numberOfMonths);
	const [mounted, setMounted] = useState(false);
	const stagesChanges = withActions && variant === 'popover';

	useEffect(() => {
		setMounted(true);
	}, []);

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

	// The calendar shows the staged range while one is being built, so a half-picked range is
	// visible without having been committed anywhere.
	const shownValue = stagesChanges ? draft : value;
	const selectedRange: DateRange | undefined = shownValue
		? { from: shownValue.from, to: shownValue.to }
		: undefined;

	const label = useMemo(() => {
		if (!value) return placeholder;
		if (!mounted) return placeholder;
		return `${formatDateShort(value.from)} — ${formatDateShort(value.to)}`;
	}, [value, formatDateShort, mounted, placeholder]);

	const handleSelect = (range: DateRange | undefined) => {
		if (stagesChanges) {
			// Kept even when only one end is picked, so the first click stays visible on the calendar
			// while the second is chosen.
			setDraft(range?.from ? { from: range.from, to: range.to ?? range.from } : null);
			return;
		}

		if (range?.from && range?.to) {
			onChange({ from: range.from, to: range.to });
			if (variant === 'popover') setOpen(false);
		}
	};

	const handlePreset = (preset: DateRangePreset) => {
		if (stagesChanges) {
			setDraft(preset.getRange());
			return;
		}

		onChange(preset.getRange());
		if (variant === 'popover') setOpen(false);
	};

	const handleApply = () => {
		onChange(draft);
		setOpen(false);
	};

	const handleReset = () => {
		onChange(null);
		setDraft(null);
		setOpen(false);
	};

	/** Reopening starts from what is applied, discarding a selection that was clicked away from. */
	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) setDraft(value);
		setOpen(nextOpen);
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
							onClick={() => handlePreset(preset)}
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
		<Popover open={open} onOpenChange={stagesChanges ? handleOpenChange : setOpen}>
			<PopoverTrigger asChild>
				<FilterTriggerButton isActive={Boolean(value)}>
					<div className="flex items-center gap-2">
						<CalendarIcon className="text-primary/80 size-4 shrink-0" />
						<span className="truncate whitespace-nowrap" suppressHydrationWarning>
							{label}
						</span>
					</div>
				</FilterTriggerButton>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="text-foreground w-auto rounded-3xl p-3 shadow-lg dark:text-white"
			>
				{calendarContent}
				{stagesChanges && (
					<FilterPopoverActions
						onApply={handleApply}
						onReset={value ? handleReset : undefined}
					/>
				)}
			</PopoverContent>
		</Popover>
	);
}
