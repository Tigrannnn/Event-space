'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BanknoteIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/translation';
import { useFormatCurrency } from '@/hooks/format';
import { useDebouncedCallback } from '@/hooks/debounce';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { FilterTriggerButton } from './FilterTriggerButton';
import { isPriceFilterApplied } from './filter-utils';
import type { EventsFiltersState, PriceBounds } from './types';

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

	const appliedRange = filters.priceRange ?? priceBounds;
	const [sliderValue, setSliderValue] = useState<[number, number]>([
		appliedRange.min,
		appliedRange.max,
	]);
	const filtersRef = useRef(filters);

	useEffect(() => {
		filtersRef.current = filters;
	}, [filters]);

	useEffect(() => {
		const nextRange = filters.priceRange ?? priceBounds;
		setSliderValue([nextRange.min, nextRange.max]);
	}, [filters.priceRange, priceBounds.min, priceBounds.max]);

	const debouncedApply = useDebouncedCallback((min: number, max: number) => {
		const isFullRange = min <= priceBounds.min && max >= priceBounds.max;
		onFiltersChange({
			...filtersRef.current,
			priceRange: isFullRange ? null : { min, max },
		});
	}, 350);

	const handleSliderChange = (value: number[]) => {
		const [min, max] = value as [number, number];
		setSliderValue([min, max]);

		const apply = (nextMin: number, nextMax: number) => {
			const isFullRange = nextMin <= priceBounds.min && nextMax >= priceBounds.max;
			onFiltersChange({
				...filtersRef.current,
				priceRange: isFullRange ? null : { min: nextMin, max: nextMax },
			});
		};

		if (variant === 'inline') {
			apply(min, max);
			return;
		}

		debouncedApply(min, max);
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
			<div className="mb-4 flex items-center justify-between gap-2">
				<span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
					{formatCurrency(sliderValue[0])}
				</span>
				<span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
					{formatCurrency(sliderValue[1])}
				</span>
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
		<Popover>
			<PopoverTrigger asChild>
				<FilterTriggerButton isActive={isApplied}>
					<BanknoteIcon className="size-4 text-primary/80" />
					{label}
				</FilterTriggerButton>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-80 rounded-3xl p-4 shadow-lg">
				{sliderContent}
			</PopoverContent>
		</Popover>
	);
}
