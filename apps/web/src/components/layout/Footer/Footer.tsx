'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localizePath } from '@/lib/i18n/config';
import { useTranslation } from '@/hooks/translation';
import { useBrand } from '@/providers/BrandProvider';

export default function Footer() {
	const translate = useTranslation();
	const brand = useBrand();
	const locale = translate.locale;
	const pathname = usePathname();

	if (pathname.includes('/admin')) return null;

	return (
		<footer className="mt-10 border-t border-gray-200 bg-white px-4 py-6 pb-20 md:pb-6 dark:border-gray-800 dark:bg-gray-900">
			<div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between dark:text-gray-400">
				<p>
					© {new Date().getFullYear()} {brand.name}
				</p>
				<nav className="flex flex-wrap gap-x-5 gap-y-2">
					<Link href={localizePath('/about', locale)} className="hover:text-primary">
						{translate('about.title')}
					</Link>
					<Link href={localizePath('/terms', locale)} className="hover:text-primary">
						{translate('legal.terms.title')}
					</Link>
					<Link href={localizePath('/privacy', locale)} className="hover:text-primary">
						{translate('legal.privacy.title')}
					</Link>
					{brand.contact.email && (
						<a href={`mailto:${brand.contact.email}`} className="hover:text-primary">
							{brand.contact.email}
						</a>
					)}
				</nav>
			</div>
		</footer>
	);
}
