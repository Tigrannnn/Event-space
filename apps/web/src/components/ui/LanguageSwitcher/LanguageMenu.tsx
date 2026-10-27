'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { defaultLocale, localeLabels, locales, type Locale } from '@/lib/i18n/config';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useTranslation } from '@/hooks/translation';
import { cn } from '@/utils/cn';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover';

/** Each language in its own tongue, so someone who cannot read the page can still find theirs. */
const LANGUAGE_NAMES: Record<Locale, string> = {
	hy: 'Հայերեն',
	ru: 'Русский',
	en: 'English',
};

/** The language switch of the minimal skin: one button showing the current language, a menu behind it. */
export default function LanguageMenu({ className }: { className?: string }) {
	const translate = useTranslation();
	const { switchLocale } = useLocalizedNavigation();
	const params = useParams();
	const locale = (params.locale as Locale) || defaultLocale;
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={translate('header.language')}
					className={cn(
						'flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-neutral-800',
						className,
					)}
				>
					<Globe className="size-[18px]" />
					<span>{localeLabels[locale]}</span>
					<ChevronDown className={cn('size-3.5 transition-transform', isOpen && 'rotate-180')} />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-48 rounded-xl border-gray-200 bg-white p-1.5 backdrop-blur-none dark:border-neutral-800 dark:bg-neutral-900"
			>
				{locales.map((item) => (
					<button
						key={item}
						type="button"
						onClick={() => {
							setIsOpen(false);
							switchLocale(item);
						}}
						aria-current={item === locale}
						className={cn(
							'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800',
							item === locale
								? 'font-semibold text-gray-900 dark:text-white'
								: 'text-gray-700 dark:text-gray-300',
						)}
					>
						{LANGUAGE_NAMES[item]}
						{item === locale && <Check className="text-primary size-4" />}
					</button>
				))}
			</PopoverContent>
		</Popover>
	);
}
