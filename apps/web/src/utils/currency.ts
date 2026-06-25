import { DEFAULT_CURRENCY, DEFAULT_LOCALE, Locale, LocaleIntlEnum } from '@event-space/shared';

/**
 * Formats a numeric value as a currency string.
 * @param value Numeric value to format
 * @param options.formatCurrencyOptions
 * @returns Formatted currency string
 */
export function formatCurrency(
	value: number | string,
	options?: {
		locale?: LocaleIntlEnum;
		currency?: string;
		minimumFractionDigits?: number;
		maximumFractionDigits?: number;
		quantity?: number;
		currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
	},
) {
	const {
		locale = DEFAULT_LOCALE,
		currency = DEFAULT_CURRENCY,
		minimumFractionDigits = 0,
		maximumFractionDigits = 2,
		quantity,
		currencyDisplay = 'code',
	} = options || {};

	const numericValue = Number(value);
	const amount = quantity !== undefined ? numericValue * quantity : numericValue;

	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		minimumFractionDigits,
		maximumFractionDigits,
		currencyDisplay,
	}).format(amount);
}
