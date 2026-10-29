'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Check, ChevronDown } from 'lucide-react';
import { defaultLocale, localeLabels, locales, type Locale } from '@/lib/i18n/config';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useTranslation } from '@/hooks/translation';
import { cn } from '@/utils/cn';
import { LANGUAGE_NAMES } from './LanguageMenu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover';

/**
 * The language switch of the soft skin: a rounded pill set in the display typeface, with a
 * roomy menu of rounded rows behind it.
 */
export default function LanguagePill({
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
						'flex h-10 items-center gap-1.5 rounded-full pr-3 pl-4 font-(family-name:--font-display) text-base font-semibold transition-colors',
						onDark
							? 'bg-white/15 text-white hover:bg-white/25'
							: 'bg-primary/10 text-primary hover:bg-primary/20',
						className,
					)}
				>
					<span>{localeLabels[locale]}</span>
					<ChevronDown className={cn('size-4 transition-transform', isOpen && 'rotate-180')} />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-52 rounded-3xl border-gray-200 bg-white p-2 backdrop-blur-none dark:border-neutral-800 dark:bg-neutral-900"
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
							'flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-left font-(family-name:--font-display) text-base transition-colors',
							item === locale
								? 'bg-primary/10 text-primary font-semibold'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800',
						)}
					>
						{LANGUAGE_NAMES[item]}
						{item === locale && (
							<span className="bg-primary flex size-5 items-center justify-center rounded-full text-white">
								<Check className="size-3" strokeWidth={3} />
							</span>
						)}
					</button>
				))}
			</PopoverContent>
		</Popover>
	);
}
