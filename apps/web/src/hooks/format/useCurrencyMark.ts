'use client';

import { useTranslation } from '@/hooks/translation';
import { localeIntl } from '@/lib/i18n/config';
import { getCurrencyMark } from '@/utils/currency';

/** The currency mark for the active locale — "֏" in Armenian, "AMD" everywhere else. */
export function useCurrencyMark(currency?: string) {
	const translate = useTranslation();

	return getCurrencyMark(localeIntl[translate.locale], currency);
}
