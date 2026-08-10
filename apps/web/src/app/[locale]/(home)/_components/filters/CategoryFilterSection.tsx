'use client';

import { useMemo, useState } from 'react';
import { Category, getCategoryTranslation } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover';
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/primitives/command';
import { CategoryPill, FilterPopoverActions, FilterTriggerButton } from '@/components/filters';
import { getExtraSelectedCategories, getTopCategories } from './filter-utils';
import type { EventsFiltersState } from './types';

interface CategoryFilterSectionProps {
	categories: Category[];
	filters: EventsFiltersState;
	onFiltersChange: (filters: EventsFiltersState) => void;
	layout?: 'inline' | 'stacked';
}

export function CategoryFilterSection({
	categories,
	filters,
	onFiltersChange,
	layout = 'inline',
}: CategoryFilterSectionProps) {
	const translate = useTranslation();
	const locale = translate.locale;
	const [moreOpen, setMoreOpen] = useState(false);
	const [draftCategories, setDraftCategories] = useState<string[]>(filters.categories);

	const topCategories = useMemo(() => getTopCategories(categories, 3), [categories]);
	const topSlugs = useMemo(() => topCategories.map((category) => category.slug), [topCategories]);
	const remainingCategories = useMemo(
		() => categories.filter((category) => !topSlugs.includes(category.slug)),
		[categories, topSlugs],
	);
	const extraSelectedCount = getExtraSelectedCategories(filters.categories, topSlugs).length;

	const toggleCategory = (slug: string) => {
		const isSelected = filters.categories.includes(slug);
		const nextCategories = isSelected
			? filters.categories.filter((item) => item !== slug)
			: [...filters.categories, slug];

		onFiltersChange({ ...filters, categories: nextCategories });
	};

	/**
	 * The pills for the top categories sit outside any popover, so they stay immediate — there is
	 * nothing to confirm. Only the "more" list stages its picks, since choosing several at once is
	 * the whole reason that list exists.
	 */
	const toggleDraftCategory = (slug: string) => {
		setDraftCategories((current) =>
			current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
		);
	};

	const handleApplyMore = () => {
		onFiltersChange({ ...filters, categories: draftCategories });
		setMoreOpen(false);
	};

	/** Clears only the categories hidden behind "more", leaving the visible pills as they are. */
	const handleResetMore = () => {
		onFiltersChange({
			...filters,
			categories: filters.categories.filter((slug) => topSlugs.includes(slug)),
		});
		setMoreOpen(false);
	};

	const handleMoreOpenChange = (nextOpen: boolean) => {
		if (nextOpen) setDraftCategories(filters.categories);
		setMoreOpen(nextOpen);
	};

	const renderPills = (items: Category[], fullWidth = false) =>
		items.map((category) => {
			const categoryTranslation = getCategoryTranslation(category, locale);
			const isActive = filters.categories.includes(category.slug);

			return (
				<CategoryPill
					key={category.id}
					isActive={isActive}
					onClick={() => toggleCategory(category.slug)}
					className={fullWidth ? 'w-full text-left' : undefined}
				>
					{categoryTranslation.name}
				</CategoryPill>
			);
		});

	if (layout === 'stacked') {
		return (
			<div className="space-y-3">
				<p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
					{translate('filters.categories')}
				</p>
				<div className="flex flex-wrap gap-2">{renderPills(categories, true)}</div>
			</div>
		);
	}

	return (
		<div className="width-[20%] flex min-w-0 items-center gap-2 overflow-x-auto">
			{renderPills(topCategories)}
			{remainingCategories.length > 0 && (
				<Popover open={moreOpen} onOpenChange={handleMoreOpenChange}>
					<PopoverTrigger asChild>
						<FilterTriggerButton isActive={extraSelectedCount > 0}>
							{extraSelectedCount > 0
								? `${translate('filters.more')} · ${extraSelectedCount}`
								: translate('filters.more')}
						</FilterTriggerButton>
					</PopoverTrigger>
					<PopoverContent
						align="start"
						className="text-foreground w-72 rounded-3xl p-0 shadow-lg dark:text-white"
					>
						<Command className="text-foreground dark:text-white">
							<CommandInput
								placeholder={translate('filters.searchCategories')}
								className="text-foreground dark:text-white"
							/>
							<CommandList>
								<CommandEmpty className="text-foreground dark:text-white">
									{translate('filters.noCategoriesFound')}
								</CommandEmpty>
								{remainingCategories.map((category) => {
									const categoryTranslation = getCategoryTranslation(category, locale);
									const displayName = categoryTranslation.name || category.slug;
									const isChecked = draftCategories.includes(category.slug);

									return (
										<CommandItem
											key={category.id}
											value={displayName}
											data-checked={isChecked}
											onSelect={() => toggleDraftCategory(category.slug)}
											className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer duration-300"
										>
											{displayName}
										</CommandItem>
									);
								})}
							</CommandList>
						</Command>
						<div className="px-3 pb-3">
							<FilterPopoverActions
								onApply={handleApplyMore}
								onReset={extraSelectedCount > 0 ? handleResetMore : undefined}
							/>
						</div>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}
