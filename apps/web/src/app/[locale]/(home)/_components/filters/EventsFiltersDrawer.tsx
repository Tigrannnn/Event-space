'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/translation';
import { FiltersDrawer } from '@/components/filters';
import { CategoryFilterSection } from './CategoryFilterSection';
import { DateRangeFilterSection } from './DateRangeFilterSection';
import { DifficultyFilterSection } from './DifficultyFilterSection';
import { GuestsFilterSection } from './GuestsFilterSection';
import { PriceRangeFilterSection } from './PriceRangeFilterSection';
import { countActiveFilters, createEmptyFilters } from './filter-utils';
import type { EventsFiltersBarProps, EventsFiltersState } from './types';

interface EventsFiltersDrawerProps extends EventsFiltersBarProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	showTrigger?: boolean;
}

export function EventsFiltersDrawer({
	categories,
	priceBounds,
	filters,
	onFiltersChange,
	isLoadingCategories = false,
	open,
	onOpenChange,
	showTrigger = true,
}: EventsFiltersDrawerProps) {
	const translate = useTranslation();
	const [draftFilters, setDraftFilters] = useState<EventsFiltersState>(filters);
	const activeCount = countActiveFilters(filters);
	// Reset is offered while something is applied or picked in the draft.
	const canReset = activeCount > 0 || countActiveFilters(draftFilters) > 0;

	// Callers may leave the sheet uncontrolled; it still has to close itself on apply/reset.
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = open !== undefined;
	const isOpen = isControlled ? open : internalOpen;

	const setOpen = (next: boolean) => {
		if (!isControlled) setInternalOpen(next);
		onOpenChange?.(next);
	};

	// Each opening starts from the applied filters, dropping a draft that was never applied.
	const [wasOpen, setWasOpen] = useState(isOpen);
	if (isOpen !== wasOpen) {
		setWasOpen(isOpen);
		if (isOpen) setDraftFilters(filters);
	}

	const handleApply = () => {
		onFiltersChange(draftFilters);
		setOpen(false);
	};

	const handleReset = () => {
		const empty = createEmptyFilters();
		setDraftFilters(empty);
		onFiltersChange(empty);
		setOpen(false);
	};

	return (
		<FiltersDrawer
			activeCount={activeCount}
			canReset={canReset}
			onApply={handleApply}
			onReset={handleReset}
			applyLabel={translate('filters.showTours')}
			open={isOpen}
			onOpenChange={setOpen}
			showTrigger={showTrigger}
		>
			{isLoadingCategories ? (
				<p className="text-sm text-gray-500">{translate('common.loading')}</p>
			) : (
				<CategoryFilterSection
					categories={categories}
					filters={draftFilters}
					onFiltersChange={setDraftFilters}
					layout="stacked"
				/>
			)}

			<div className="space-y-3">
				<p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
					{translate('filters.when')}
				</p>
				<DateRangeFilterSection
					filters={draftFilters}
					onFiltersChange={setDraftFilters}
					numberOfMonths={1}
					variant="inline"
				/>
			</div>

			<DifficultyFilterSection filters={draftFilters} onFiltersChange={setDraftFilters} variant="inline" />

			<GuestsFilterSection filters={draftFilters} onFiltersChange={setDraftFilters} variant="inline" />

			<PriceRangeFilterSection
				filters={draftFilters}
				priceBounds={priceBounds}
				onFiltersChange={setDraftFilters}
				variant="inline"
			/>
		</FiltersDrawer>
	);
}
