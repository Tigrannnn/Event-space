'use client';

import { Languages } from 'lucide-react';
import { localeLabels, locales, type Locale } from '@/lib/i18n/config';

import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { cn } from '@/utils/cn';
import { useI18nStore } from '@/stores/i18n';

export default function LanguageSwitcher({ className }: { className?: string }) {
	const { locale, translate } = useI18nStore();
	const { switchLocale } = useLocalizedNavigation();

	return (
		<div
			className={cn(
				'flex items-center gap-1 rounded-xl bg-white/15 p-1 text-white backdrop-blur-md',
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
