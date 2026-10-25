'use client';

import React from 'react';
import { useFormatCurrency } from '@/hooks/format';
import { useTranslation } from '@/hooks/translation';

export interface PriceBadgeProps {
	price: number | string;
	basePrice?: number | string | null;
	discountPercent?: number | null;
}

export const PriceBadge = ({ price, basePrice, discountPercent }: PriceBadgeProps) => {
	const formatCurrency = useFormatCurrency();
	const translate = useTranslation();

	const percent = discountPercent ?? 0;
	const isDiscounted = percent > 0 && basePrice !== null && basePrice !== undefined;

	return (
		<div className="absolute top-2 left-2 z-10 flex items-center gap-2 sm:top-4 sm:left-4">
			<div className="flex items-center justify-center rounded-full bg-white/90 px-4 py-2 shadow-sm backdrop-blur-md dark:bg-gray-900/90 dark:shadow-gray-900/50">
				{isDiscounted && (
					<span
						className="mr-1.5 text-[10px] leading-none font-semibold text-gray-400 line-through sm:text-[11px]"
						suppressHydrationWarning
					>
						{formatCurrency(basePrice)}
					</span>
				)}
				<span
					className="text-primary text-[11px] leading-none font-black tracking-wide sm:text-[12px] md:text-[14px]"
					suppressHydrationWarning
				>
					{isDiscounted ? `${translate('event.priceFrom')} ` : ''}
					{formatCurrency(price)}
				</span>
			</div>

			{isDiscounted && (
				<span className="flex items-center justify-center rounded-full bg-red-500 px-2.5 py-1.5 text-[10px] leading-none font-black tracking-wide text-white shadow-sm sm:text-[11px]">
					{translate('event.discountOff', { percent })}
				</span>
			)}
		</div>
	);
};
