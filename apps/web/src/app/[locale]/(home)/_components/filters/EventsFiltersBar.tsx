'use client';

import { isFlatSkin } from '@/utils/skin';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/translation';
import { useSkin } from '@/providers/BrandProvider';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/primitives/button';
import { HorizontalScroll } from '@/components/ui/HorizontalScroll';
import { CategoryFilterSection } from './CategoryFilterSection';
import { DateRangeFilterSection } from './DateRangeFilterSection';
import { DifficultyFilterSection } from './DifficultyFilterSection';
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
	const skin = useSkin();
	const isMinimal = isFlatSkin(skin);
	const isListing = skin === 'listing';
	const isMarket = skin === 'market' || skin === 'drawer';
	const hasActiveFilters = countActiveFilters(filters) > 0;

	const handleReset = () => {
		onFiltersChange(createEmptyFilters());
	};

	if (isListing) {
		// One row at every width, no drawer: the filters first, then the categories, each a plain
		// button after the last, and the row scrolls sideways when it runs out of room.
		return (
			<div className="sticky top-0 z-30 -mx-4 mb-4 border-b border-gray-200 bg-white/95 px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-neutral-800 dark:bg-neutral-950/95 in-data-[skin=drawer]:border-gray-200/60 in-data-[skin=drawer]:bg-white/60 in-data-[skin=drawer]:backdrop-blur-xl in-data-[skin=drawer]:dark:border-white/10 in-data-[skin=drawer]:dark:bg-neutral-950/50">
				<div className="mx-auto max-w-[1336px]">
					<HorizontalScroll
						className="min-h-11 items-center gap-3"
						fadeClassName="from-white dark:from-neutral-950"
					>
						<DateRangeFilterSection filters={filters} onFiltersChange={onFiltersChange} />
						<GuestsFilterSection filters={filters} onFiltersChange={onFiltersChange} />
						<DifficultyFilterSection filters={filters} onFiltersChange={onFiltersChange} />
						<PriceRangeFilterSection
							filters={filters}
							priceBounds={priceBounds}
							onFiltersChange={onFiltersChange}
						/>

						<div className="h-6 w-px shrink-0 bg-gray-200 dark:bg-neutral-800" />

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

						{hasActiveFilters && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-9 shrink-0 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
								onClick={handleReset}
							>
								{translate('filters.reset')}
							</Button>
						)}
					</HorizontalScroll>
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				'sticky top-0 z-30 -mx-4 mb-4 border-b px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8',
				skin === 'drawer'
					? 'border-gray-200/60 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/50'
					: isMinimal
					? 'border-gray-200 bg-white/95 dark:border-neutral-800 dark:bg-neutral-950/95'
					: 'border-gray-200/70 bg-gray-50/90 shadow-sm dark:border-gray-700/70 dark:bg-gray-900/85',
			)}
		>
			<div className={cn(isMarket && 'mx-auto max-w-[1400px]')}>
				<div className="md:hidden">
					<EventsFiltersDrawer
						categories={categories}
						priceBounds={priceBounds}
						filters={filters}
						onFiltersChange={onFiltersChange}
						isLoadingCategories={isLoadingCategories}
					/>
				</div>

				<div className="hidden md:block">
					<HorizontalScroll
						className="min-h-11 items-center gap-3"
						fadeClassName={
							isMinimal ? 'from-white dark:from-neutral-950' : 'from-gray-50 dark:from-gray-900'
						}
					>
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
						<DifficultyFilterSection filters={filters} onFiltersChange={onFiltersChange} />
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
					</HorizontalScroll>
				</div>
			</div>
		</div>
	);
}
