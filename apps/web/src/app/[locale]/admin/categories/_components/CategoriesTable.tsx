'use client';

import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Search, Trash2, Eye, X } from 'lucide-react';
import Button from '@/components/ui/Buttons/Button';
import TablePagination from '@/components/ui/TablePagination';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/Table';
import { useConfirm } from '@/hooks/confirmModal';
import { useAdminCategories, useDeleteCategory } from '@/features/admin/hooks/useAdmin';
import { useModalStore, ModalType } from '@/stores';
import { getCategoryTranslation, type PaginatedResponse, type Category } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';

const pageSizeOptions = [10, 20, 50, 100].map((pageSize) => ({
	value: String(pageSize),
	label: `${pageSize} / page`,
}));

interface CategoriesTableProps {
	initialCategories: PaginatedResponse<Category>;
	disableFetch?: boolean;
}

export default function CategoriesTable({ initialCategories, disableFetch }: CategoriesTableProps) {
	const translate = useTranslation();
	const locale = translate.locale;
	const [skip, setSkip] = useState(initialCategories.skip);
	const [limit, setLimit] = useState(initialCategories.take);
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const { openModal } = useModalStore();
	const confirm = useConfirm();
	const { data, isFetching } = useAdminCategories(
		{
			skip,
			limit,
			search: search || undefined,
		},
		{ enabled: !disableFetch },
	);
	const deleteCategory = useDeleteCategory();
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const navigation = useLocalizedNavigation();
	const categoriesResponse = disableFetch ? initialCategories : data ?? initialCategories;
	const pageStart = categoriesResponse.total === 0 ? 0 : categoriesResponse.skip + 1;
	const pageEnd = Math.min(
		categoriesResponse.skip + categoriesResponse.data.length,
		categoriesResponse.total,
	);
	const canGoPrevious = categoriesResponse.skip > 0;
	const canGoNext = categoriesResponse.hasMore && categoriesResponse.nextSkip !== null;
	const hasActiveFilters = Boolean(search || disableFetch);

	const resetPagination = () => {
		setSkip(0);
	};

	const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSearch(searchInput.trim());
		resetPagination();
	};

	const handlePageSizeChange = (value: string) => {
		setLimit(Number(value));
		resetPagination();
	};

	const handleResetFilters = () => {
		setSearchInput('');
		setSearch('');
		resetPagination();
		if (disableFetch) {
			navigation.push('/admin/categories');
		}
	};

	const handlePreviousPage = () => {
		setSkip((currentSkip) => Math.max(currentSkip - limit, 0));
	};

	const handleNextPage = () => {
		if (categoriesResponse.nextSkip !== null) {
			setSkip(categoriesResponse.nextSkip);
		}
	};

	const handleDelete = async (category: Category) => {
		const categoryTranslation = getCategoryTranslation(category, locale);
		const confirmed = await confirm({
			title: translate('admin.deleteCategory'),
			message: `${translate('admin.deleteCategoryMessage')} "${categoryTranslation.name}"`,
			confirmText: translate('admin.delete'),
			variant: 'danger',
		});

		if (confirmed) {
			setDeletingId(category.id);
			deleteCategory.mutate(category.id, {
				onSettled: () => setDeletingId(null),
			});
		}
	};

	return (
		<>
			<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
				<div className="flex flex-col gap-4 px-3 py-3 sm:px-5 sm:py-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="font-semibold text-gray-900 dark:text-gray-100">
								{translate('admin.allCategories')}
							</p>
							<p className="text-sm text-gray-500">
								{translate('admin.showing')} {pageStart}-{pageEnd} {translate('admin.of')}{' '}
								{categoriesResponse.total} categories
							</p>
						</div>
						<Button type="button" size="sm" onClick={() => openModal(ModalType.CreateCategory)}>
							<Plus className="h-4 w-4" />
							{translate('admin.createCategory')}
						</Button>
					</div>

					<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
						<form onSubmit={handleSearchSubmit} className="flex min-w-0 flex-1 gap-2">
							<div className="relative min-w-0 flex-1">
								<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<input
									value={searchInput}
									onChange={(event) => setSearchInput(event.target.value)}
									placeholder={translate('admin.searchCategoriesPlaceholder')}
									className="focus:border-primary h-10 w-full rounded-md border bg-transparent pr-3 pl-9 text-sm transition outline-none placeholder:text-gray-400"
								/>
							</div>
							<Button type="submit" size="sm" variant="secondary" disabled={isFetching}>
								{translate('header.search')}
							</Button>
						</form>

						<div className="flex flex-wrap items-center gap-2">
							{hasActiveFilters && (
								<Button type="button" size="sm" variant="secondary" onClick={handleResetFilters}>
									<X className="h-4 w-4" />
									{translate('admin.reset')}
								</Button>
							)}
						</div>
					</div>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="px-3 sm:px-5">{translate('admin.title')}</TableHead>
							<TableHead>{translate('admin.slug')}</TableHead>
							<TableHead className="w-32">{translate('admin.actions')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{categoriesResponse.data.length === 0 && (
							<TableRow>
								<TableCell colSpan={3} className="px-3 py-8 text-center text-gray-500 sm:px-5">
									{translate('admin.noCategoriesFound')}
								</TableCell>
							</TableRow>
						)}

						{categoriesResponse.data.map((category) => {
							const categoryTranslation = getCategoryTranslation(category, locale);
							return (
								<TableRow key={category.id}>
									<TableCell className="px-3 sm:px-5">
										<div className="max-w-md min-w-0">
											<button
												type="button"
												onClick={() => openModal(ModalType.CategoryDetails, { category })}
												className="text-primary cursor-pointer truncate text-left font-medium transition hover:underline"
											>
												{categoryTranslation.name}
											</button>
										</div>
									</TableCell>
									<TableCell>{category.slug}</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button
												type="button"
												size="xs"
												variant="secondary"
												onClick={() => openModal(ModalType.CategoryDetails, { category })}
												aria-label={`${translate('admin.viewDetails')}: ${categoryTranslation.name}`}
											>
												<Eye className="h-4 w-4" />
											</Button>
											<Button
												type="button"
												size="xs"
												variant="secondary"
												onClick={() => openModal(ModalType.UpdateCategory, { category })}
												aria-label={`${translate('admin.edit')}: ${categoryTranslation.name}`}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												type="button"
												size="xs"
												variant="danger"
												onClick={() => handleDelete(category)}
												isLoading={deletingId === category.id && deleteCategory.isPending}
												aria-label={`${translate('admin.delete')}: ${categoryTranslation.name}`}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>

				<TablePagination
					skip={categoriesResponse.skip}
					limit={limit}
					isLoading={isFetching}
					canGoPrevious={canGoPrevious}
					canGoNext={canGoNext}
					onPreviousPage={handlePreviousPage}
					onNextPage={handleNextPage}
				/>
			</div>
		</>
	);
}
