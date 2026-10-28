'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localizePath } from '@/lib/i18n/config';
import { useTranslation } from '@/hooks/translation';
import { useBrand } from '@/providers/BrandProvider';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { getCategoryTranslation } from '@event-space/shared';
import { useSkin } from '@/providers/BrandProvider';
import { cn } from '@/utils/cn';
import ContactIcons from '../Header/ContactIcons';

export default function Footer() {
	const translate = useTranslation();
	const brand = useBrand();
	const skin = useSkin();
	const isMinimal = skin !== 'classic';
	const isListing = skin === 'listing';
	const muted = isListing ? 'text-white/75' : 'text-gray-500 dark:text-gray-400';
	const linkHover = isListing ? 'hover:text-white hover:underline' : 'hover:text-primary';
	const locale = translate.locale;
	const pathname = usePathname();
	const { data: categories } = useCategories();

	if (pathname.includes('/admin')) return null;

	return (
		<footer
			className={cn(
				'mt-10 border-t border-gray-200 bg-white px-4 py-6 pb-20 md:pb-6 dark:border-gray-800 dark:bg-gray-900 in-data-[skin=minimal]:dark:border-neutral-800 in-data-[skin=minimal]:dark:bg-neutral-950',
				isListing && 'bg-primary dark:bg-primary border-transparent text-white dark:border-transparent',
			)}
		>
			{isMinimal && (
				<div className="mx-auto mb-4 max-w-7xl">
					<ContactIcons onDark={isListing} square={isListing} className="-ml-2.5" />
				</div>
			)}

			{categories && categories.length > 0 && (
				<nav className={`mx-auto mb-5 flex max-w-7xl flex-wrap gap-x-5 gap-y-2 text-sm ${muted}`}>
					{categories.map((category) => (
						<Link
							key={category.id}
							href={localizePath(`/category/${category.slug}`, locale)}
							className={linkHover}
						>
							{getCategoryTranslation(category, locale).name}
						</Link>
					))}
				</nav>
			)}

			<div
				className={`mx-auto flex max-w-7xl flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between ${muted}`}
			>
				<p>
					© {new Date().getFullYear()} {brand.name}
				</p>
				<nav className="flex flex-wrap gap-x-5 gap-y-2">
					<Link href={localizePath('/about', locale)} className={linkHover}>
						{translate('about.title')}
					</Link>
					<Link href={localizePath('/terms', locale)} className={linkHover}>
						{translate('legal.terms.title')}
					</Link>
					<Link href={localizePath('/privacy', locale)} className={linkHover}>
						{translate('legal.privacy.title')}
					</Link>
					{brand.contact.email && (
						<a href={`mailto:${brand.contact.email}`} className={linkHover}>
							{brand.contact.email}
						</a>
					)}
				</nav>
			</div>
		</footer>
	);
}
