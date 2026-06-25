'use client';

import { useTranslation } from '@/hooks/translation';
import { localeIntl } from '@/lib/i18n/config';
import { formatCurrency } from '@/utils/currency';

export function useFormatCurrency() {
	const translate = useTranslation();
	const locale = translate.locale;
	const intlLocale = localeIntl[locale];

	return (
		value: number | string,
		options?: {
			currency?: string;
			minimumFractionDigits?: number;
			maximumFractionDigits?: number;
			quantity?: number;
		},
	) => {
		return formatCurrency(value, {
			locale: intlLocale,
			...options,
		});
	};
}
