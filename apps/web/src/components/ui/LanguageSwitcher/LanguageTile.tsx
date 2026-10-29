'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { defaultLocale, locales, type Locale } from '@/lib/i18n/config';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useTranslation } from '@/hooks/translation';
import { cn } from '@/utils/cn';
import { LANGUAGE_NAMES } from './LanguageMenu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover';

/**
 * The language switch of the market skin: a grey tile with the code of the current language,
 * matching the grey tiles of the contact icons, and a compact list with the code on the right.
 */
export default function LanguageTile({ className }: { className?: string }) {
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
						'hover:bg-primary/10 hover:text-primary flex h-10 items-center gap-1 rounded-xl bg-gray-100 px-3 text-sm font-bold text-gray-800 uppercase transition-colors dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700',
						className,
					)}
				>
					{locale}
					<ChevronDown className={cn('size-3.5 transition-transform', isOpen && 'rotate-180')} />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-44 rounded-xl border-gray-200 bg-white p-1 backdrop-blur-none dark:border-neutral-800 dark:bg-neutral-900"
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
							'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
							item === locale
								? 'bg-primary/10 text-primary font-semibold'
								: 'text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-800',
						)}
					>
						{LANGUAGE_NAMES[item]}
						<span className="text-xs font-bold text-gray-400 uppercase">{item}</span>
					</button>
				))}
			</PopoverContent>
		</Popover>
	);
}
