'use client';

import { useTranslation } from '@/hooks/translation';
import { formatCurrency } from '@/utils/currency';

export function useFormatCurrency() {
    const translate = useTranslation();
    const locale = translate.locale;

    return (
        value: number | string,
        options?: {
            currency?: string;
            minimumFractionDigits?: number;
            maximumFractionDigits?: number;
            quantity?: number;
        }
    ) => {
        return formatCurrency(value, {
            locale,
            ...options,
        });
    };
}
