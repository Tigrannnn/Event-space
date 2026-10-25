'use client';

import { quoteBooking } from '@event-space/shared';
import { useFormatCurrency } from '@/hooks/format';
import { useTranslation } from '@/hooks/translation';

export interface OccurrencePriceProps {
	price: number;
	discountPercent?: number | null;
	size?: 'sm' | 'md';
	className?: string;
}

const sizes = {
	sm: { price: 'text-sm font-bold', base: 'text-xs', badge: 'text-[10px] px-1.5 py-0.5' },
	md: { price: 'text-base font-bold', base: 'text-sm', badge: 'text-[11px] px-2 py-0.5' },
};

export function OccurrencePrice({
	price,
	discountPercent,
	size = 'sm',
	className = '',
}: OccurrencePriceProps) {
	const formatCurrency = useFormatCurrency();
	const translate = useTranslation();
	const quote = quoteBooking({ price, discountPercent }, { quantity: 1 });
	const style = sizes[size];

	return (
		<span className={`flex flex-wrap items-baseline gap-1.5 ${className}`}>
			<span className={`text-primary ${style.price}`} suppressHydrationWarning>
				{formatCurrency(quote.unitPrice)}
			</span>
			{quote.discountPercent > 0 && (
				<>
					<span className={`text-gray-400 line-through ${style.base}`} suppressHydrationWarning>
						{formatCurrency(quote.baseUnitPrice)}
					</span>
					<span
						className={`rounded-full bg-red-500 leading-none font-black text-white ${style.badge}`}
					>
						{translate('event.discountOff', { percent: quote.discountPercent })}
					</span>
				</>
			)}
		</span>
	);
}
