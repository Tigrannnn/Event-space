'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontalIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/translation';
import { Button } from '@/components/ui/primitives/button';
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/primitives/sheet';
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
		<Sheet open={open} onOpenChange={onOpenChange}>
			{showTrigger && (
				<SheetTrigger asChild>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="h-9 w-full rounded-lg border-gray-200/80 bg-white/90 font-medium shadow-sm md:hidden dark:bg-white/10 dark:text-white dark:border-gray-700/80"
					>
						<SlidersHorizontalIcon className="size-4 text-primary/80" />
						{activeCount > 0
							? `${translate('filters.filters')} · ${activeCount}`
							: translate('filters.filters')}
					</Button>
				</SheetTrigger>
			)}
			<SheetContent
				side="bottom"
				className="flex max-h-[80vh] overflow-y-auto flex-col rounded-t-3xl border-t border-gray-200/80 bg-gray-50/95 p-0 shadow-lg backdrop-blur-md dark:border-gray-700/80 dark:bg-gray-900/95"
				showCloseButton
			>
				<SheetHeader className="border-b border-gray-200/70 px-4 py-4 dark:border-gray-700/70">
					<SheetTitle>{translate('filters.filters')}</SheetTitle>
				</SheetHeader>

				<div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
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

					<GuestsFilterSection
						filters={draftFilters}
						onFiltersChange={setDraftFilters}
						variant="inline"
					/>

					<PriceRangeFilterSection
						filters={draftFilters}
						priceBounds={priceBounds}
						onFiltersChange={setDraftFilters}
						variant="inline"
					/>
				</div>

				<SheetFooter className="flex-row items-center justify-between border-t border-gray-200/70 bg-white/90 px-4 py-4 dark:border-gray-700/70 dark:bg-gray-900/90">
					<Button type="button" variant="ghost" onClick={handleReset}>
						{translate('filters.reset')}
					</Button>
					<Button type="button" onClick={handleApply}>
						{translate('filters.showTours')}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
