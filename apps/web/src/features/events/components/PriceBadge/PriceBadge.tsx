'use client';

import { formatCurrency } from '@/utils/currency';
import { Locale } from '@event-space/shared';
import React from 'react';

export interface PriceBadgeProps {
	price: number | string;
	initialLocale: Locale;
}

/**
 * Badge component for displaying event price, mirrors CategoryBadge styling
 */
export const PriceBadge = ({ price, initialLocale }: PriceBadgeProps) => {
	return (
		<div className="absolute top-5 right-5 z-10 flex items-center justify-center rounded-full bg-white/90 px-4 py-2 shadow-sm backdrop-blur-md dark:bg-gray-900/90 dark:shadow-gray-900/50">
			<span className="text-primary text-[13px] leading-none font-black tracking-wide">
				{formatCurrency(price, { locale: initialLocale })}
			</span>
		</div>
	);
};
