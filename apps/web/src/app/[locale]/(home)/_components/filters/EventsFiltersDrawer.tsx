'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/translation';
import { FiltersDrawer } from '@/components/filters';
import { CategoryFilterSection } from './CategoryFilterSection';
import { DateRangeFilterSection } from './DateRangeFilterSection';
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
	const activeCount = countActiveFilters(filters, priceBounds);

	useEffect(() => {
		if (open) {
			setDraftFilters(filters);
		}
	}, [filters, open]);

	const handleApply = () => {
		onFiltersChange(draftFilters);
		onOpenChange?.(false);
	};

	const handleReset = () => {
		const empty = createEmptyFilters();
		setDraftFilters(empty);
		onFiltersChange(empty);
		onOpenChange?.(false);
	};

	return (
		<FiltersDrawer
			activeCount={activeCount}
			onApply={handleApply}
			onReset={handleReset}
			applyLabel={translate('filters.showTours')}
			open={open}
			onOpenChange={onOpenChange}
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
