'use client';

import React from 'react';
import { useTranslation } from '@/hooks/translation';

export interface CapacityBarProps {
	current: number;
	max: number;
}

/**
 * Progress bar showing event capacity
 */
export const CapacityBar = ({ current, max }: CapacityBarProps) => {
	const translate = useTranslation();
	const rate = max > 0 ? (current / max) * 100 : 0;

	return (
		<div className="space-y-2">
			<div className="flex justify-between text-[10px] font-bold tracking-widest uppercase">
				<span className="text-gray-400">{translate('event.availability')}</span>
				<span className="text-primary">
					{current} / {max} {translate('event.participants')}
				</span>
			</div>
			<div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 sm:h-2.5 dark:bg-gray-700">
				<div
					className="from-primary to-accent h-3 rounded-full bg-linear-to-r transition-all duration-500 sm:h-2.5"
					style={{ width: `${rate}%` }}
				/>
			</div>
		</div>
	);
};
