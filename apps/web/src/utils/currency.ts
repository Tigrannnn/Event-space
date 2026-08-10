import { DEFAULT_CURRENCY, DEFAULT_LOCALE, Locale, LocaleIntlEnum } from '@event-space/shared';

/**
 * How a currency is written out, per language it might be shown in — never left to
 * `Intl.NumberFormat` to decide.
 *
 * Two separate reasons, not one:
 *
 * - Correctness across environments. `style: 'currency'` asks the runtime's own CLDR data for
 *   the glyph, and that data differs by ICU build — Node.js and a given browser disagreed on
 *   what AMD should render as for `hy-AM`, one producing "֏" and the other falling back to the
 *   bare code. The same component renders once on the server and once in the browser, so any
 *   such disagreement is a guaranteed hydration mismatch, not just a cosmetic one.
 * - Correctness of the choice itself. Even where the runtime agrees with itself, "correct" isn't
 *   one answer: ֏ is the right call for an Armenian reader, who recognises it, and the wrong call
 *   for a Russian or English reader, who has never seen it and would read "15 000 ֏" as a typo
 *   before they read it as a price. The ISO code reads as a price to everyone even if unfamiliar.
 *
 * Currencies not listed fall back to Intl's own symbol, which is fine for currencies with
 * near-universal recognition and ICU support (USD, EUR); AMD is the one this app actually prices
 * in, so it's the one worth owning outright rather than trusting either runtime or convention.
 *
 * A currency that opts into this table is keyed by `Record<LocaleIntlEnum, string>` — not
 * `Partial` — on purpose: adding a locale (say, `ka-GE` for Georgian) without deciding how AMD
 * should read in it is exactly the mistake this table exists to rule out, so it's a compile
 * error, not a silent fall-through back to whatever that locale's runtime happens to guess.
 */
const AMD_DISPLAY: Record<LocaleIntlEnum, string> = {
	'hy-AM': '֏',
	'ru-RU': 'AMD',
	'en-US': 'AMD',
};

const CURRENCY_DISPLAY: Partial<Record<string, Record<LocaleIntlEnum, string>>> = {
	AMD: AMD_DISPLAY,
};

/**
 * The currency mark on its own, without an amount.
 *
 * For inputs, where the number is typed rather than formatted: the field holds a bare number so it
 * stays editable, and the mark sits beside it as a label.
 */
export function getCurrencyMark(locale: LocaleIntlEnum, currency: string = DEFAULT_CURRENCY): string {
	return CURRENCY_DISPLAY[currency]?.[locale] ?? currency;
}

/**
 * Formats a numeric value as a currency string.
 *
 * The digit grouping, decimal separator, and whether the currency mark leads or trails the
 * amount all come from `Intl.NumberFormat` — those are genuinely locale convention, not a data
 * lookup that varies by ICU build, and have shown no sign of disagreeing between environments.
 * Only the mark's actual text is read from `CURRENCY_DISPLAY` above, via `formatToParts` with
 * `currencyDisplay: 'code'` (a currency's own ISO code, unlike its glyph, is not up for
 * interpretation) so the position we're substituting into is unambiguous.
 *
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
	},
) {
	const {
		locale = DEFAULT_LOCALE,
		currency = DEFAULT_CURRENCY,
		minimumFractionDigits = 0,
		maximumFractionDigits = 2,
		quantity,
	} = options || {};

	const numericValue = Number(value);
	const amount = quantity !== undefined ? numericValue * quantity : numericValue;

	const display = CURRENCY_DISPLAY[currency]?.[locale];
	if (!display) {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency,
			minimumFractionDigits,
			maximumFractionDigits,
		}).format(amount);
	}

	const parts = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		currencyDisplay: 'code',
		minimumFractionDigits,
		maximumFractionDigits,
	}).formatToParts(amount);

	return parts.map((part) => (part.type === 'currency' ? display : part.value)).join('');
}
