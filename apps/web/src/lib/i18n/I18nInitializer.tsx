'use client';

import { useEffect, useRef } from 'react';
import { type Locale } from './config';
import { useI18nStore } from '@/stores/i18n';

export function I18nInitializer({ locale }: { locale: Locale }) {
    const setLocale = useI18nStore((state) => state.setLocale);
    const initialized = useRef(false);

    // Initialize the locale only once when the component is mounted
    if (!initialized.current) {
        setLocale(locale);
        initialized.current = true;
    }

    // On the off chance that the locale changes at runtime, update the store accordingly
    useEffect(() => {
        setLocale(locale);
    }, [locale, setLocale]);

    return null;
}