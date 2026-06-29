'use client';

import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/features/categories/api/categories.api';
import { useTranslation } from '@/hooks/translation';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Button from '@/components/ui/Buttons/Button';
import { Loader2 } from 'lucide-react';
import { Category, getCategoryTranslation } from '@event-space/shared';

export default function CategoryFilter() {
	const translate = useTranslation();
	const locale = translate.locale;
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const selectedCategorySlug = searchParams.get('category') || '';

	const { data: categories, isLoading } = useQuery({
		queryKey: ['categories', locale],
		queryFn: () => categoryApi.getCategories(),
	});
	console.log(categories);
	const handleCategoryClick = (slug: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (slug === selectedCategorySlug) {
			params.delete('category');
		} else if (slug === '') {
			params.delete('category');
		} else {
			params.set('category', slug);
		}
		params.delete('cursor');
		router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
	};

	return (
		<div className="mb-6 flex flex-wrap gap-2 sm:mb-8">
			{isLoading ? (
				<div className="flex items-center gap-2">
					<Loader2 className="h-5 w-5 animate-spin text-gray-400" />
					<span className="text-sm text-gray-500 dark:text-gray-400">{translate('common.loading')}</span>
				</div>
			) : (
				<>
					<Button
						variant={!selectedCategorySlug ? 'primary' : 'secondary'}
						onClick={() => handleCategoryClick('')}
						size="sm"
					>
						{translate('common.all')}
					</Button>
					{categories?.map((category: Category) => {
						const categoryTranslation = getCategoryTranslation(category, locale);
						console.log(categoryTranslation);
						return (
							<Button
								key={category.id}
								variant={selectedCategorySlug === category.slug ? 'primary' : 'secondary'}
								onClick={() => handleCategoryClick(category.slug)}
								size="sm"
							>
								{categoryTranslation.name}
							</Button>
						);
					})}
				</>
			)}
		</div>
	);
}
