import { create } from 'zustand';
import { I18nState } from './types';
import { MessageKey, translate } from '@/lib/i18n/messages';
import { defaultLocale } from '@/lib/i18n/config';

export const useI18nStore = create<I18nState>((set, get) => ({
    locale: defaultLocale,
    setLocale: (locale) => set({ locale }),
    translate: (key) => {
        const { locale } = get();
        return translate(locale, key);
    },
}));

/**
 * Variant for use outside of React components (e.g., in functions, fetch requests, or axios interceptors)
 */
export const getTranslation = (key: MessageKey) => {
    const locale = useI18nStore.getState().locale;
    return translate(locale, key);
};