'use client';

import { useParams } from 'next/navigation';
import { localeLabels, locales, type Locale, defaultLocale } from '@/lib/i18n/config';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/hooks/translation';

export default function zLanguageSwitcher({ className }: { className?: string }) {
    const translate = useTranslation();
    const { switchLocale } = useLocalizedNavigation();
    
    const params = useParams();
    const locale = (params.locale as Locale) || defaultLocale;

    return (
        <div
            className={cn(
                'flex items-center gap-0.5 rounded-lg bg-white/15 p-1 text-white backdrop-blur-md',
                className,
            )}
            aria-label={translate('header.language')}
        >
            {locales.map((item: Locale) => (
                <button
                    key={item}
                    type="button"
                    onClick={() => switchLocale(item)}
                    className={cn(
                        'h-7 min-w-8 cursor-pointer rounded-md px-1.5 text-[10px] font-semibold transition-colors',
                        item === locale ? 'bg-white text-gray-900' : 'text-white hover:bg-white/15',
                    )}
                    aria-pressed={item === locale}
                >
                    {localeLabels[item]}
                </button>
            ))}
        </div>
    );
}