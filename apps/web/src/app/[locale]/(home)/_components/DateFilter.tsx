'use client';

import { useTranslation } from '@/hooks/translation';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function DateFilter() {
	const translate = useTranslation();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const handleDateChange = (key: 'startDate' | 'endDate', value: string) => {
		const params = new URLSearchParams(searchParams);
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		router.replace(`${pathname}?${params.toString()}`);
	};

	const clearFilters = () => {
		const params = new URLSearchParams(searchParams);
		params.delete('startDate');
		params.delete('endDate');
		router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
	};

	const hasActiveFilters = searchParams.has('startDate') || searchParams.has('endDate');

	return (
		<div className="mb-6 flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-xl dark:bg-gray-800">
			<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
				{translate('admin.dateFilter')}
			</h3>
			<div className="flex flex-wrap items-center gap-3">
				<label className="flex flex-col gap-1">
					<span className="text-xs text-gray-600 dark:text-gray-400">
						{translate('admin.startDate')}
					</span>
					<input
						type="date"
						value={searchParams.get('startDate') || ''}
						onChange={(e) => handleDateChange('startDate', e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
					/>
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-xs text-gray-600 dark:text-gray-400">
						{translate('admin.endDate')}
					</span>
					<input
						type="date"
						value={searchParams.get('endDate') || ''}
						onChange={(e) => handleDateChange('endDate', e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
					/>
				</label>
				{hasActiveFilters && (
					<button
						onClick={clearFilters}
						className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
					>
						{translate('admin.clearFilters')}
					</button>
				)}
			</div>
		</div>
	);
}
