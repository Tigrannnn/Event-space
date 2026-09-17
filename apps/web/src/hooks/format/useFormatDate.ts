'use client';

import { useTranslation } from '@/hooks/translation';
import { localeIntl } from '@/lib/i18n/config';
import {
    formatDateYear,
    formatDateShort,
    formatDateTime,
    formatDuration,
    formatRelativeTime,
    formatTime,
} from '@/utils/date';

export function useFormatDate() {
    const translate = useTranslation();
    const locale = translate.locale;
    const intlLocale = localeIntl[locale];

    return {
        formatDateYear: (date: string | Date | null | undefined) => formatDateYear(date, intlLocale),
        formatDateShort: (date: string | Date | null | undefined) => formatDateShort(date, intlLocale),
        formatDateTime: (date: string | Date | null | undefined) => formatDateTime(date, intlLocale),
        formatTime: (date: string | Date | null | undefined) => formatTime(date, intlLocale),
        formatDuration: (minutes: number) => formatDuration(minutes, intlLocale),
        formatRelative: (date: string | Date | null | undefined) =>
            formatRelativeTime(date, intlLocale),
    };
}
