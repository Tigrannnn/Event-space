'use client';

import { useMemo, useState } from 'react';
import { Category, getCategoryTranslation } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/primitives/command';
import { CategoryPill, FilterTriggerButton } from './FilterTriggerButton';
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
		<div className="flex min-w-0 items-center gap-2 width-[20%] overflow-x-auto">
			{renderPills(topCategories)}
			{remainingCategories.length > 0 && (
				<Popover open={moreOpen} onOpenChange={setMoreOpen}>
					<PopoverTrigger asChild>
						<FilterTriggerButton isActive={extraSelectedCount > 0}>
							{extraSelectedCount > 0
								? `${translate('filters.more')} · ${extraSelectedCount}`
								: translate('filters.more')}
						</FilterTriggerButton>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-72 rounded-3xl p-0 text-foreground shadow-lg dark:text-white">
						<Command className="text-foreground dark:text-white">
							<CommandInput placeholder={translate('filters.searchCategories')} className="text-foreground dark:text-white" />
							<CommandList>
								<CommandEmpty className="text-foreground dark:text-white">{translate('filters.noCategoriesFound')}</CommandEmpty>
								{remainingCategories.map((category) => {
									const categoryTranslation = getCategoryTranslation(category, locale);
									const isChecked = filters.categories.includes(category.slug);

									return (
										<CommandItem
											key={category.id}
											value={categoryTranslation.name}
											data-checked={isChecked}
											onSelect={() => toggleCategory(category.slug)}
										>
											{categoryTranslation.name}
										</CommandItem>
									);
								})}
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}
