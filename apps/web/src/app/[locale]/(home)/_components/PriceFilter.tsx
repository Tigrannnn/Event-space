'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/translation';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Buttons/Button';

export default function PriceFilter() {
	const translate = useTranslation();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const appliedMinPrice = searchParams.get('minPrice') || '';
	const appliedMaxPrice = searchParams.get('maxPrice') || '';

	const [minPriceInput, setMinPriceInput] = useState(appliedMinPrice);
	const [maxPriceInput, setMaxPriceInput] = useState(appliedMaxPrice);

	useEffect(() => {
		setMinPriceInput(appliedMinPrice);
		setMaxPriceInput(appliedMaxPrice);
	}, [appliedMinPrice, appliedMaxPrice]);

	const hasActiveFilters = Boolean(appliedMinPrice || appliedMaxPrice);
	const hasPendingChanges =
		minPriceInput !== appliedMinPrice || maxPriceInput !== appliedMaxPrice;

	const applyFilters = () => {
		const params = new URLSearchParams(searchParams);

		if (minPriceInput) {
			params.set('minPrice', minPriceInput);
		} else {
			params.delete('minPrice');
		}

		if (maxPriceInput) {
			params.set('maxPrice', maxPriceInput);
		} else {
			params.delete('maxPrice');
		}

		params.delete('cursor');
		router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
	};

	const clearFilters = () => {
		setMinPriceInput('');
		setMaxPriceInput('');

		const params = new URLSearchParams(searchParams);
		params.delete('minPrice');
		params.delete('maxPrice');
		params.delete('cursor');
		router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		applyFilters();
	};

	return (
		<div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
			<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
				{translate('admin.priceFilter')}
			</h3>
			<form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
				<label className="flex flex-col gap-1">
					<span className="text-xs text-gray-600 dark:text-gray-400">
						{translate('admin.minPrice')}
					</span>
					<input
						type="number"
						min={0}
						value={minPriceInput}
						onChange={(e) => setMinPriceInput(e.target.value)}
						placeholder={translate('admin.minPrice')}
						className="focus:ring-primary w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
					/>
				</label>
				<span className="pb-2 text-sm text-gray-500">-</span>
				<label className="flex flex-col gap-1">
					<span className="text-xs text-gray-600 dark:text-gray-400">
						{translate('admin.maxPrice')}
					</span>
					<input
						type="number"
						min={0}
						value={maxPriceInput}
						onChange={(e) => setMaxPriceInput(e.target.value)}
						placeholder={translate('admin.maxPrice')}
						className="focus:ring-primary w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700"
					/>
				</label>
				<Button type="submit" size="sm" disabled={!hasPendingChanges}>
					{translate('admin.applyFilter')}
				</Button>
				{hasActiveFilters && (
					<Button type="button" size="sm" variant="secondary" onClick={clearFilters}>
						{translate('admin.clearFilters')}
					</Button>
				)}
			</form>
		</div>
	);
}
