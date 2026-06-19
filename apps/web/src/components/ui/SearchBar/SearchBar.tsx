'use client';

import React from 'react';
import { SearchBarProps } from './types';
import { XIcon } from 'lucide-react';

/**
 * Search input component for filtering events
 */
export const SearchBar = ({
	value,
	onChange,
	onKeyDown,
	placeholder = 'Search events...',
}: SearchBarProps) => {
	return (
		<div className="relative w-full">
			<input
				type="text"
				value={value ?? ''}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={onKeyDown}
				placeholder={placeholder}
				className="text-primary focus:ring-primary/20 focus:border-primary w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-8 placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:outline-none sm:rounded-2xl sm:px-5 sm:py-3.5 sm:pr-11 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
			/>
			{value && (
				<button
					onClick={() => onChange('')}
					className="hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 transition-colors sm:right-4 dark:text-gray-500 dark:hover:text-gray-300"
					type="button"
				>
					<XIcon />
				</button>
			)}
		</div>
	);
};
