'use client';

import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/translation';
import { Button } from '@/components/ui/primitives/button';
import { CategoryFilterSection } from './CategoryFilterSection';
import { DateRangeFilterSection } from './DateRangeFilterSection';
import { GuestsFilterSection } from './GuestsFilterSection';
import { PriceRangeFilterSection } from './PriceRangeFilterSection';
import { EventsFiltersDrawer } from './EventsFiltersDrawer';
import { countActiveFilters, createEmptyFilters } from './filter-utils';
import type { EventsFiltersBarProps } from './types';

export function EventsFiltersBar({
	categories,
	priceBounds,
	filters,
	onFiltersChange,
	isLoadingCategories = false,
}: EventsFiltersBarProps) {
	const translate = useTranslation();
	const hasActiveFilters = countActiveFilters(filters, priceBounds) > 0;

	const handleReset = () => {
		onFiltersChange(createEmptyFilters());
	};

	return (
		<div className="sticky top-0 z-30 -mx-4 mb-4 border-b border-gray-200/70 bg-gray-50/90 px-4 py-2.5 shadow-sm backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-gray-700/70 dark:bg-gray-900/85">
			<div className="md:hidden">
				<EventsFiltersDrawer
					categories={categories}
					priceBounds={priceBounds}
					filters={filters}
					onFiltersChange={onFiltersChange}
					isLoadingCategories={isLoadingCategories}
				/>
			</div>

			<div className="hidden min-h-11 items-center gap-3 overflow-x-auto md:flex">
				<div className="flex min-w-0 shrink-0 items-center">
					{isLoadingCategories ? (
						<div className="flex items-center gap-2 text-sm text-gray-500">
							<Loader2 className="size-4 animate-spin" />
							{translate('common.loading')}
						</div>
					) : (
						<CategoryFilterSection
							categories={categories}
							filters={filters}
							onFiltersChange={onFiltersChange}
						/>
					)}
				</div>

				<div className="h-6 w-px shrink-0 bg-gray-200 dark:bg-gray-700" />

				<DateRangeFilterSection filters={filters} onFiltersChange={onFiltersChange} />
				<GuestsFilterSection filters={filters} onFiltersChange={onFiltersChange} />
				<PriceRangeFilterSection
					filters={filters}
					priceBounds={priceBounds}
					onFiltersChange={onFiltersChange}
				/>

				{hasActiveFilters && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="ml-auto h-9 shrink-0 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
						onClick={handleReset}
					>
						{translate('filters.reset')}
					</Button>
				)}
			</div>
		</div>
	);
}
