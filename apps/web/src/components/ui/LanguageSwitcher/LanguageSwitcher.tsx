'use client';

import { useParams } from 'next/navigation';
import { localeLabels, locales, type Locale, defaultLocale } from '@/lib/i18n/config';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/hooks/translation';

interface LanguageSwitcherProps {
	className?: string;
	variant?: 'glass' | 'admin';
}

export default function LanguageSwitcher({ className, variant = 'glass' }: LanguageSwitcherProps) {
	const translate = useTranslation();
	const { switchLocale } = useLocalizedNavigation();

	const params = useParams();
	const locale = (params.locale as Locale) || defaultLocale;

	const isGlass = variant === 'glass';

	return (
		<div
			className={cn(
				'flex items-center gap-0.5 rounded-lg p-1 transition-colors',
				isGlass ? 'bg-white/15 text-white backdrop-blur-md' : 'bg-transparent',
				className,
			)}
			aria-label={translate('header.language')}
		>
			{locales.map((item: Locale) => {
				const isActive = item === locale;

				return (
					<button
						key={item}
						type="button"
						onClick={() => switchLocale(item)}
						className={cn(
							'h-7 min-w-8 cursor-pointer rounded-md px-2 text-[10px] font-semibold transition-all',
							isGlass
								? isActive
									? 'bg-white text-gray-900'
									: 'text-white hover:bg-white/15'
								: isActive
									? 'border-primary bg-primary/10 text-primary border'
									: 'text-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
						)}
						aria-pressed={isActive}
					>
						{localeLabels[item]}
					</button>
				);
			})}
		</div>
	);
}
