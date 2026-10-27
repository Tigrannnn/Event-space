'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { defaultLocale, locales, type Locale } from '@/lib/i18n/config';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useTranslation } from '@/hooks/translation';
import { cn } from '@/utils/cn';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover';

const LANGUAGE_NAMES: Record<Locale, string> = {
	hy: 'Հայերեն',
	ru: 'Русский',
	en: 'English',
};

/**
 * The language switch of the listing skin: a bordered square showing the two-letter code of the
 * current language, with a short list behind it where each row pairs a code with the name.
 */
export default function LanguageCode({
	className,
	onDark = false,
}: {
	className?: string;
	onDark?: boolean;
}) {
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
						'flex size-10 items-center justify-center rounded-md border text-sm font-bold uppercase transition-colors',
						onDark
							? 'border-white/40 text-white hover:bg-white/15'
							: 'border-gray-300 text-gray-800 hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-100 dark:hover:bg-neutral-800',
						className,
					)}
				>
					{locale}
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-52 rounded-md border-gray-200 bg-white p-1 backdrop-blur-none dark:border-neutral-800 dark:bg-neutral-900"
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
							'flex w-full items-center gap-3 rounded px-2 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800',
							item === locale && 'bg-primary/10',
						)}
					>
						<span
							className={cn(
								'flex size-7 items-center justify-center rounded text-xs font-bold uppercase',
								item === locale
									? 'bg-primary text-white'
									: 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300',
							)}
						>
							{item}
						</span>
						<span className="text-gray-900 dark:text-gray-100">{LANGUAGE_NAMES[item]}</span>
					</button>
				))}
			</PopoverContent>
		</Popover>
	);
}
