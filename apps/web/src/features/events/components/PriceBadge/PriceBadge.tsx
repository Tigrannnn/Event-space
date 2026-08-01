'use client';

import { useFormatCurrency } from '@/hooks/format';
import React from 'react';

export interface PriceBadgeProps {
	price: number | string;
}

/**
 * Badge component for displaying event price, mirrors CategoryBadge styling
 */
export const PriceBadge = ({ price }: PriceBadgeProps) => {
	const formatCurrency = useFormatCurrency();

	return (
		<div className="absolute top-2 left-2 z-10 flex items-center justify-center rounded-full bg-white/90 px-4 py-2 shadow-sm backdrop-blur-md sm:top-4 sm:left-4 dark:bg-gray-900/90 dark:shadow-gray-900/50">
			<span
				className="text-primary text-[11px] sm:text-[12px] md:text-[14px] leading-none font-black tracking-wide"
				suppressHydrationWarning
			>
				{formatCurrency(price)}
			</span>
		</div>
	);
};
