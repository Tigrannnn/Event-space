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
		<div className="absolute top-5 left-5 z-10 flex items-center justify-center rounded-full bg-white/90 px-4 py-2 shadow-sm backdrop-blur-md dark:bg-gray-900/90 dark:shadow-gray-900/50">
			<span
				className="text-primary text-[13px] leading-none font-black tracking-wide"
				suppressHydrationWarning
			>
				{formatCurrency(price)}
			</span>
		</div>
	);
};
