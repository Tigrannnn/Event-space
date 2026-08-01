'use client';

import React from 'react';
import { SearchBarProps } from './types';
import { XIcon } from 'lucide-react';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';

/**
 * Search input component for filtering events
 */
export const SearchBar = ({
	value,
	onChange,
	onKeyDown,
	placeholder = 'Search events...',
}: SearchBarProps) => {
	const router = useLocalizedNavigation();

	return (
		<div className="relative w-full">
			<input
				type="text"
				value={value ?? ''}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={onKeyDown}
				placeholder={placeholder}
				className="text-primary focus:ring-primary/20 focus:border-primary w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-8 text-sm placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:outline-none lg:rounded-2xl lg:px-5 lg:py-3.5 lg:pr-11 lg:text-base dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
			/>
			{value && (
				<button
					onClick={() => {
						onChange('');
						router.push('/');
					}}
					className="hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 transition-colors lg:right-4 dark:text-gray-500 dark:hover:text-gray-300"
					type="button"
				>
					<XIcon className="w-5 lg:w-7" />
				</button>
			)}
		</div>
	);
};
