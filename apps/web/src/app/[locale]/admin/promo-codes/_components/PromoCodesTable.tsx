'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
import { useAdminPromoCodes, useDeletePromoCode } from '@/features/admin/hooks/useAdmin';
import { useModalStore, ModalType } from '@/stores';
import type { PaginatedResponse, PromoCode } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useFormatDate } from '@/hooks/format/useFormatDate';
import { useUrlFilters } from '@/hooks/urlFilters';
import AdminFilterBar from '../../_components/AdminFilterBar';
import Select from '@/components/ui/Select';
import {
	countActivePromoCodesFilters,
	emptyPromoCodesFilters,
	parsePromoCodesFilters,
	serializePromoCodesFilters,
} from './promo-codes-filters';

const pageSizeOptions = [10, 20, 50, 100].map((pageSize) => ({
	value: String(pageSize),
	label: `${pageSize} / page`,
}));

interface PromoCodesTableProps {
	initialPromoCodes: PaginatedResponse<PromoCode>;
}

export default function PromoCodesTable({ initialPromoCodes }: PromoCodesTableProps) {
	const translate = useTranslation();
	const { formatDateTime } = useFormatDate();
	const { filters, setFilters, resetFilters, activeCount } = useUrlFilters({
		parse: parsePromoCodesFilters,
		serialize: serializePromoCodesFilters,
		empty: emptyPromoCodesFilters,
		countActive: countActivePromoCodesFilters,
	});
	const { skip, limit } = filters;

	const [searchInput, setSearchInput] = useState(filters.search ?? '');
	useEffect(() => {
		setSearchInput(filters.search ?? '');
	}, [filters.search]);

	const { openModal } = useModalStore();
	const confirm = useConfirm();
	const { data, isFetching } = useAdminPromoCodes(filters);
	const deletePromoCode = useDeletePromoCode();
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const promoCodesResponse = data ?? initialPromoCodes;
	const pageStart = promoCodesResponse.total === 0 ? 0 : promoCodesResponse.skip + 1;
	const pageEnd = Math.min(
		promoCodesResponse.skip + promoCodesResponse.data.length,
		promoCodesResponse.total,
	);
	const canGoPrevious = promoCodesResponse.skip > 0;
	const canGoNext = promoCodesResponse.hasMore && promoCodesResponse.nextSkip !== null;
	const hasActiveFilters = activeCount > 0;

	const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFilters({ ...filters, search: searchInput.trim() || undefined, skip: 0 });
	};

	const handleResetFilters = () => {
		setSearchInput('');
		resetFilters();
	};

	const handlePreviousPage = () => {
		setFilters({ ...filters, skip: Math.max(skip - limit, 0) });
	};

	const handleNextPage = () => {
		if (promoCodesResponse.nextSkip !== null) {
			setFilters({ ...filters, skip: promoCodesResponse.nextSkip });
		}
	};

	const handleDelete = async (promoCode: PromoCode) => {
		const confirmed = await confirm({
			title: translate('admin.deletePromoCode'),
			message: `${translate('admin.deletePromoCodeMessage')} "${promoCode.code}"`,
			confirmText: translate('admin.delete'),
			variant: 'danger',
		});

		if (confirmed) {
			setDeletingId(promoCode.id);
			deletePromoCode.mutate(promoCode.id, {
				onSettled: () => setDeletingId(null),
			});
		}
	};

	return (
		<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
			<div className="flex flex-col gap-4 px-3 py-3 sm:px-5 sm:py-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100">
							{translate('admin.allPromoCodes')}
						</p>
						<p className="text-xs text-gray-500 sm:text-sm">
							{translate('admin.showing')} {pageStart}-{pageEnd} {translate('admin.of')}{' '}
							{promoCodesResponse.total}
						</p>
					</div>
					<Button
						type="button"
						size="sm"
						className="max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
						onClick={() => openModal(ModalType.CreatePromoCode)}
					>
						<Plus className="h-4 w-4" />
						{translate('admin.createPromoCode')}
					</Button>
				</div>

				<AdminFilterBar
					searchValue={searchInput}
					onSearchValueChange={setSearchInput}
					onSearchSubmit={handleSearchSubmit}
					searchPlaceholder={translate('admin.searchPromoCodesPlaceholder')}
					isFetching={isFetching}
					activeCount={activeCount}
					showReset={hasActiveFilters}
					onReset={handleResetFilters}
				>
					<Select
						variant="filter"
						size="sm"
						value={limit}
						onValueChange={(value) => setFilters({ ...filters, limit: Number(value), skip: 0 })}
						options={pageSizeOptions.map((ps) => ({
							...ps,
							label: `${ps.value} ${translate('admin.pageSize')}`,
						}))}
					/>
				</AdminFilterBar>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="px-3 sm:px-5">{translate('admin.promoCodeCode')}</TableHead>
						<TableHead>{translate('admin.promoCodeDiscountPercent')}</TableHead>
						<TableHead>{translate('admin.promoCodeUsage')}</TableHead>
						<TableHead>{translate('admin.active')}</TableHead>
						<TableHead>{translate('admin.promoCodeValidUntil')}</TableHead>
						<TableHead className="w-24">{translate('admin.actions')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{promoCodesResponse.data.length === 0 && (
						<TableRow>
							<TableCell colSpan={6} className="px-3 py-8 text-center text-gray-500 sm:px-5">
								{translate('admin.noPromoCodesFound')}
							</TableCell>
						</TableRow>
					)}

					{promoCodesResponse.data.map((promoCode) => (
						<TableRow key={promoCode.id}>
							<TableCell className="px-3 font-mono font-medium sm:px-5">{promoCode.code}</TableCell>
							<TableCell>−{promoCode.discountPercent}%</TableCell>
							<TableCell>
								{promoCode.usageCount}
								{promoCode.maxUses !== null ? ` / ${promoCode.maxUses}` : ''}
							</TableCell>
							<TableCell>
								<span
									className={`rounded-full px-2 py-0.5 text-xs font-medium ${
										promoCode.active
											? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
											: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
									}`}
								>
									{promoCode.active ? translate('admin.active') : translate('admin.inactive')}
								</span>
							</TableCell>
							<TableCell>
								{promoCode.validUntil ? formatDateTime(promoCode.validUntil) : '—'}
							</TableCell>
							<TableCell>
								<div className="flex gap-2">
									<Button
										type="button"
										size="xs"
										variant="secondary"
										onClick={() => openModal(ModalType.UpdatePromoCode, { promoCode })}
										aria-label={`${translate('admin.edit')}: ${promoCode.code}`}
									>
										<Pencil className="h-4 w-4" />
									</Button>
									<Button
										type="button"
										size="xs"
										variant="danger"
										onClick={() => handleDelete(promoCode)}
										isLoading={deletingId === promoCode.id && deletePromoCode.isPending}
										aria-label={`${translate('admin.delete')}: ${promoCode.code}`}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<TablePagination
				skip={promoCodesResponse.skip}
				limit={limit}
				isLoading={isFetching}
				canGoPrevious={canGoPrevious}
				canGoNext={canGoNext}
				onPreviousPage={handlePreviousPage}
				onNextPage={handleNextPage}
			/>
		</div>
	);
}
