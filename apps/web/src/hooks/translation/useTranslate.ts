'use client';

import { useParams } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n/config';
import { translate, type MessageKey, type MessageParams } from '@/lib/i18n/messages';
import { Locale } from '@event-space/shared';

export function useTranslation() {
    const params = useParams();
    const locale = (params.locale as Locale) || defaultLocale;

    const t = (key: MessageKey, values?: MessageParams) => translate(locale, key, values);

    t.locale = locale;

    return t;
}