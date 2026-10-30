'use client';

import type { ModalDividerProps } from './types';

export default function ModalDivider({ text = 'or' }: ModalDividerProps) {
	return (
		<div className="relative my-6">
			<div className="absolute inset-0 flex items-center">
				<div className="w-full border-t border-gray-200 dark:border-gray-700 in-data-[skin=market]:dark:border-neutral-700 in-data-[skin=drawer]:dark:border-neutral-700"></div>
			</div>
			<div className="relative flex justify-center">
				<span className="in-data-[skin=soft]:bg-gray-50 bg-white px-4 text-sm font-medium text-gray-400 dark:bg-gray-900 dark:text-gray-500 in-data-[skin=market]:dark:bg-neutral-900 in-data-[skin=drawer]:dark:bg-neutral-900">
					{text}
				</span>
			</div>
		</div>
	);
}
