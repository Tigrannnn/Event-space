'use client';

import { useParams } from 'next/navigation'; // 1. Импортируем useParams
import { localeLabels, locales, type Locale, defaultLocale } from '@/lib/i18n/config'; // 2. Добавляем defaultLocale
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/hooks/translation';

export default function LanguageSwitcher({ className }: { className?: string }) {
    const translate = useTranslation();
    const { switchLocale } = useLocalizedNavigation();
    
    const params = useParams();
    const locale = (params.locale as Locale) || defaultLocale;

    return (
        <div
            className={cn(
                'flex items-center gap-1 rounded-xl bg-white/15 p-2 text-white backdrop-blur-md',
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
                        'h-8 min-w-9 cursor-pointer rounded-lg px-2 text-xs font-semibold transition-colors',
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