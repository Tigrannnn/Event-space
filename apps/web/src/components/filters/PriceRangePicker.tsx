'use client';

import { useMemo, useState } from 'react';
import { BanknoteIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/translation';
import { useCurrencyMark, useFormatCurrency } from '@/hooks/format';
import { useDebouncedCallback } from '@/hooks/debounce';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover';
import { Slider } from '@/components/ui/primitives/slider';
import { FilterPopoverActions } from './FilterPopoverActions';
import { FilterTriggerButton } from './FilterTriggerButton';
import type { NumberBounds } from './types';

/** Spinners are hidden: their arrows step by 1, which is meaningless against a 25 000 price. */
const priceFieldClass =
	'border-primary/40 focus:border-primary h-9 w-full [appearance:textfield] rounded-xl border bg-white pr-9 pl-3 text-sm font-semibold text-primary outline-none transition dark:bg-gray-900 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

interface PriceRangePickerProps {
	value: NumberBounds | null;
	onChange: (value: NumberBounds | null) => void;
	/** The ends of the slider. A value outside them can't be expressed, so callers widen it to fit. */
	bounds: NumberBounds;
	/** Trigger text while nothing is applied. */
	placeholder: string;
	/** Heading inside the panel. Defaults to the same word as the trigger. */
	title?: string;
	variant?: 'popover' | 'inline';
	/**
	 * Hold changes back until an explicit apply, and close on it. Off by default so a caller that
	 * wants the quicker live-filtering feel keeps it.
	 */
	withActions?: boolean;
}

/**
 * A price range as a slider plus two typed fields, either in a popover or laid out inline.
 *
 * Shared rather than written twice because the storefront and the admin table ask for the same
 * thing, and the fiddly parts — when to clamp a typed number, what an empty field means, when a
 * range counts as "no filter at all" — are exactly the parts that drift apart if duplicated.
 */
export function PriceRangePicker({
	value,
	onChange,
	bounds,
	placeholder,
	title,
	variant = 'popover',
	withActions = false,
}: PriceRangePickerProps) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const currencyMark = useCurrencyMark();

	const applied = value ?? bounds;
	const [draft, setDraft] = useState<[number, number]>([applied.min, applied.max]);
	const [isOpen, setIsOpen] = useState(false);
	const stagesChanges = withActions && variant === 'popover';

	// A range covering everything is the same as no filter, so it is reported as cleared rather
	// than as a filter that happens to exclude nothing.
	const isApplied = Boolean(value) && (applied.min > bounds.min || applied.max < bounds.max);

	const commit = (min: number, max: number) => {
		const coversEverything = min <= bounds.min && max >= bounds.max;
		onChange(coversEverything ? null : { min, max });
	};

	const debouncedCommit = useDebouncedCallback(commit, 350);

	const handleSliderChange = (next: number[]) => {
		const [min, max] = next as [number, number];
		setDraft([min, max]);

		if (!stagesChanges) {
			debouncedCommit(min, max);
		}
	};

	/**
	 * Settles a typed price against the other end of the range.
	 *
	 * Clamping happens on commit rather than per keystroke: with a lower bound of 15 000, clamping
	 * as you type makes "25000" impossible to enter, because the first "2" would jump to 15 000 and
	 * swallow the rest. An empty field falls back to the bound it replaces — reading it as 0 would
	 * silently widen the filter instead of clearing that end of it.
	 */
	const commitTypedPrice = (edge: 'min' | 'max', rawValue: string) => {
		const [currentMin, currentMax] = draft;
		const parsed = Number(rawValue);
		const fallback = edge === 'min' ? bounds.min : bounds.max;
		const typed = rawValue.trim() === '' || Number.isNaN(parsed) ? fallback : parsed;
		const clamped = Math.min(Math.max(Math.round(typed), bounds.min), bounds.max);

		// The ends can't cross: a lower bound typed above the upper one pins to it, not past it.
		const next: [number, number] =
			edge === 'min'
				? [Math.min(clamped, currentMax), currentMax]
				: [currentMin, Math.max(clamped, currentMin)];

		setDraft(next);

		if (!stagesChanges) {
			commit(next[0], next[1]);
		}
	};

	const handleApply = () => {
		commit(draft[0], draft[1]);
		setIsOpen(false);
	};

	const handleReset = () => {
		onChange(null);
		setDraft([bounds.min, bounds.max]);
		setIsOpen(false);
	};

	/** Reopening starts from what is applied, discarding an edit that was clicked away from. */
	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			const current = value ?? bounds;
			setDraft([current.min, current.max]);
		}
		setIsOpen(nextOpen);
	};

	const label = useMemo(() => {
		if (!isApplied || !value) return placeholder;
		return `${formatCurrency(value.min)} – ${formatCurrency(value.max)}`;
	}, [formatCurrency, isApplied, placeholder, value]);

	const renderField = (edge: 'min' | 'max') => {
		const index = edge === 'min' ? 0 : 1;

		return (
			<div className="relative flex-1">
				<input
					type="number"
					inputMode="numeric"
					// Remounting on a new slider value keeps the field in step with the handles without
					// a second piece of state holding the text mid-typing.
					key={`${edge}-${draft[index]}`}
					defaultValue={draft[index]}
					min={bounds.min}
					max={bounds.max}
					onBlur={(event) => commitTypedPrice(edge, event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') event.currentTarget.blur();
					}}
					aria-label={translate(edge === 'min' ? 'filters.minPrice' : 'filters.maxPrice')}
					className={priceFieldClass}
				/>
				<span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-gray-400">
					{currencyMark}
				</span>
			</div>
		);
	};

	const content = (
		<>
			<p className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
				{title ?? placeholder}
			</p>
			<div className="mb-4 flex items-center gap-2">
				{renderField('min')}
				<span className="text-sm text-gray-400">–</span>
				{renderField('max')}
			</div>
			<Slider
				min={bounds.min}
				max={bounds.max}
				step={Math.max(100, Math.round((bounds.max - bounds.min) / 100))}
				value={draft}
				onValueChange={handleSliderChange}
				className="py-2"
			/>
		</>
	);

	if (variant === 'inline') {
		return (
			<div className="rounded-3xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700/70 dark:bg-gray-800/80">
				{content}
			</div>
		);
	}

	return (
		<Popover open={isOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<FilterTriggerButton isActive={isApplied}>
					<BanknoteIcon className="text-primary/80 size-4" />
					{label}
				</FilterTriggerButton>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="text-foreground w-80 rounded-3xl p-4 shadow-lg dark:text-white"
			>
				{content}
				{stagesChanges && (
					<FilterPopoverActions
						onApply={handleApply}
						onReset={isApplied ? handleReset : undefined}
					/>
				)}
			</PopoverContent>
		</Popover>
	);
}
