import { useParams } from 'next/navigation';
import { type Locale, defaultLocale } from '@/lib/i18n/config';
import { translate, type MessageKey } from '@/lib/i18n/messages';

export function useTranslation() {
    const params = useParams();
    const locale = (params.locale as Locale) || defaultLocale;

    const t = (key: MessageKey) => translate(locale, key);
    
    t.locale = locale;

    return t;
}