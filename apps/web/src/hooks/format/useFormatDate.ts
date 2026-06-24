'use client';

import { useTranslation } from '@/hooks/translation';
import { localeIntl } from '@/lib/i18n/config';
import {
    formatDateYear,
    formatDateShort,
    formatDateTime,
    formatTime,
} from '@/utils/date';

export function useFormatDate() {
    const translate = useTranslation();
    const locale = translate.locale;
    const intlLocale = localeIntl[locale];

    return {
        formatDateYear: (date: string | Date) => formatDateYear(date, intlLocale),
        formatDateShort: (date: string | Date) => formatDateShort(date, intlLocale),
        formatDateTime: (date: string | Date) => formatDateTime(date, intlLocale),
        formatTime: (date: string | Date) => formatTime(date, intlLocale),
    };
}
