'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BanknoteIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/translation';
import { useCurrencyMark, useFormatCurrency } from '@/hooks/format';
import { useDebouncedCallback } from '@/hooks/debounce';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover';
import { Slider } from '@/components/ui/primitives/slider';
import { FilterPopoverActions, FilterTriggerButton } from '@/components/filters';
import { isPriceFilterApplied } from './filter-utils';
import type { EventsFiltersState, PriceBounds } from './types';

/** Spinners are hidden: the arrows step by 1, which is meaningless against a 25 000 price. */
const priceFieldClass =
	'border-primary/40 focus:border-primary h-9 w-full [appearance:textfield] rounded-xl border bg-white pr-9 pl-3 text-sm font-semibold text-primary outline-none transition dark:bg-gray-900 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

interface PriceRangeFilterSectionProps {
	filters: EventsFiltersState;
	priceBounds: PriceBounds;
	onFiltersChange: (filters: EventsFiltersState) => void;
	variant?: 'popover' | 'inline';
}

export function PriceRangeFilterSection({
	filters,
	priceBounds,
	onFiltersChange,
	variant = 'popover',
}: PriceRangeFilterSectionProps) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const currencyMark = useCurrencyMark();

	const appliedRange = filters.priceRange ?? priceBounds;
	const [sliderValue, setSliderValue] = useState<[number, number]>([
		appliedRange.min,
		appliedRange.max,
	]);
	const [isOpen, setIsOpen] = useState(false);
	const filtersRef = useRef(filters);

	useEffect(() => {
		filtersRef.current = filters;
	}, [filters]);

	useEffect(() => {
		const nextRange = filters.priceRange ?? priceBounds;
		setSliderValue([nextRange.min, nextRange.max]);
	}, [filters.priceRange, priceBounds.min, priceBounds.max]);

	const applyRange = (min: number, max: number) => {
		const isFullRange = min <= priceBounds.min && max >= priceBounds.max;
		onFiltersChange({
			...filtersRef.current,
			priceRange: isFullRange ? null : { min, max },
		});
	};

	const debouncedApply = useDebouncedCallback(applyRange, 350);

	const handleSliderChange = (value: number[]) => {
		const [min, max] = value as [number, number];
		setSliderValue([min, max]);

		// Inline belongs to the drawer, which applies everything at once, so dragging writes through
		// to its draft. In a popover the range is staged until apply.
		if (variant === 'inline') {
			debouncedApply(min, max);
		}
	};

	const handleApply = () => {
		applyRange(sliderValue[0], sliderValue[1]);
		setIsOpen(false);
	};

	const handleReset = () => {
		onFiltersChange({ ...filtersRef.current, priceRange: null });
		setSliderValue([priceBounds.min, priceBounds.max]);
		setIsOpen(false);
	};

	/** Reopening shows what is applied, not an edit that was abandoned by clicking away. */
	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			const applied = filters.priceRange ?? priceBounds;
			setSliderValue([applied.min, applied.max]);
		}
		setIsOpen(nextOpen);
	};

	/**
	 * Takes a typed price and settles it against the other end of the range.
	 *
	 * Clamping happens here rather than on every keystroke: with a lower bound of 15 000, clamping
	 * as you type makes "25000" impossible to enter, because the first "2" would jump to 15 000 and
	 * swallow the rest. An empty field falls back to the bound it replaces — reading it as 0 would
	 * silently widen the filter instead of clearing that end of it.
	 */
	const commitTypedPrice = (edge: 'min' | 'max', rawValue: string) => {
		const [currentMin, currentMax] = sliderValue;
		const parsed = Number(rawValue);
		const fallback = edge === 'min' ? priceBounds.min : priceBounds.max;
		const value = rawValue.trim() === '' || Number.isNaN(parsed) ? fallback : parsed;
		const clamped = Math.min(Math.max(Math.round(value), priceBounds.min), priceBounds.max);

		// The two ends can't cross: a lower bound typed above the upper one pins to it, not past it.
		const next: [number, number] =
			edge === 'min'
				? [Math.min(clamped, currentMax), currentMax]
				: [currentMin, Math.max(clamped, currentMin)];

		setSliderValue(next);

		if (variant === 'inline') {
			applyRange(next[0], next[1]);
		}
	};

	const isApplied = isPriceFilterApplied(filters.priceRange, priceBounds);

	const label = useMemo(() => {
		if (!isApplied || !filters.priceRange) return translate('filters.price');
		return `${formatCurrency(filters.priceRange.min)} – ${formatCurrency(filters.priceRange.max)}`;
	}, [filters.priceRange, formatCurrency, isApplied, translate]);

	const sliderContent = (
		<>
			<p className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
				{translate('filters.price')}
			</p>
			<div className="mb-4 flex items-center gap-2">
				<div className="relative flex-1">
					<input
						type="number"
						inputMode="numeric"
						// Remounting on a new slider value is what keeps the field in step with the
						// handles without a second piece of state to hold the text being typed.
						key={`min-${sliderValue[0]}`}
						defaultValue={sliderValue[0]}
						min={priceBounds.min}
						max={priceBounds.max}
						onBlur={(event) => commitTypedPrice('min', event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter') event.currentTarget.blur();
						}}
						aria-label={translate('filters.minPrice')}
						className={priceFieldClass}
					/>
					<span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-gray-400">
						{currencyMark}
					</span>
				</div>

				<span className="text-sm text-gray-400">–</span>

				<div className="relative flex-1">
					<input
						type="number"
						inputMode="numeric"
						key={`max-${sliderValue[1]}`}
						defaultValue={sliderValue[1]}
						min={priceBounds.min}
						max={priceBounds.max}
						onBlur={(event) => commitTypedPrice('max', event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter') event.currentTarget.blur();
						}}
						aria-label={translate('filters.maxPrice')}
						className={priceFieldClass}
					/>
					<span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-gray-400">
						{currencyMark}
					</span>
				</div>
			</div>
			<Slider
				min={priceBounds.min}
				max={priceBounds.max}
				step={Math.max(100, Math.round((priceBounds.max - priceBounds.min) / 100))}
				value={sliderValue}
				onValueChange={handleSliderChange}
				className="py-2"
			/>
		</>
	);

	if (variant === 'inline') {
		return (
			<div className="rounded-3xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700/70 dark:bg-gray-800/80">
				{sliderContent}
			</div>
		);
	}

	return (
		<Popover open={isOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<FilterTriggerButton isActive={isApplied}>
					<BanknoteIcon className="size-4 text-primary/80" />
					{label}
				</FilterTriggerButton>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-80 rounded-3xl p-4 text-foreground shadow-lg dark:text-white">
				{sliderContent}
				<FilterPopoverActions onApply={handleApply} onReset={isApplied ? handleReset : undefined} />
			</PopoverContent>
		</Popover>
	);
}
