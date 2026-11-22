'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Send } from 'lucide-react';
import { getCategoryTranslation } from '@event-space/shared';
import { localizePath } from '@/lib/i18n/config';
import { useTranslation } from '@/hooks/translation';
import { useBrand } from '@/providers/BrandProvider';
import { useCategories } from '@/features/categories/hooks/useCategories';

const heading = 'text-sm font-extrabold tracking-wide uppercase';
const link = 'transition-colors hover:text-(--brand-accent)';

export default function FooterCapsule() {
	const translate = useTranslation();
	const locale = translate.locale;
	const brand = useBrand();
	const { contact } = brand;
	const { data: categories } = useCategories();

	const logo = brand.logoOnDark ?? brand.logo;
	const emails = [...(contact.extraEmails ?? []), ...(contact.email ? [contact.email] : [])];
	const phones = [...(contact.phone ? [contact.phone] : []), ...(contact.extraPhones ?? [])];
	const socials = [
		{ href: contact.telegram, label: 'Telegram', Icon: Send },
		{ href: contact.instagram, label: 'Instagram', Icon: Instagram },
		{ href: contact.facebook, label: 'Facebook', Icon: Facebook },
	].filter((social) => social.href);

	const navLinks = [
		{ href: '/about', label: translate('about.title') },
		{ href: '/', label: translate('header.home') },
		...(categories ?? []).slice(0, 4).map((category) => ({
			href: `/category/${category.slug}`,
			label: getCategoryTranslation(category, locale).name,
		})),
	];

	return (
		<footer className="capsule-footer mt-16 px-4 pt-14 pb-24 text-white sm:px-6 md:pb-8 lg:px-8">
			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
				<Link
					href={localizePath('/', locale)}
					aria-label={translate('header.goHome')}
					className="w-fit"
				>
					{logo ? (
						<Image
							src={logo}
							alt={brand.name}
							width={181}
							height={42}
							unoptimized
							className="h-10 w-auto"
						/>
					) : (
						<span className="text-3xl font-black tracking-tight">{brand.name}</span>
					)}
				</Link>

				<nav className="flex flex-col items-start gap-5">
					{navLinks.map((item) => (
						<Link key={item.href} href={localizePath(item.href, locale)} className={`${heading} ${link}`}>
							{item.label}
						</Link>
					))}
				</nav>

				{(emails.length > 0 || phones.length > 0) && (
					<div className="flex flex-col items-start gap-4">
						<p className={heading}>{translate('common.footerContacts')}</p>
						{emails.map((email) => (
							<a key={email} href={`mailto:${email}`} className={`text-lg font-medium ${link}`}>
								{email}
							</a>
						))}
						{phones.map((phone) => (
							<a
								key={phone}
								href={`tel:${phone.replace(/\s/g, '')}`}
								className={`text-lg font-medium ${link}`}
							>
								{phone}
							</a>
						))}
					</div>
				)}

				<div className="flex flex-col items-start gap-5">
					{socials.length > 0 && (
						<>
							<p className={heading}>{translate('common.footerFindUs')}</p>
							<div className="flex items-center gap-6">
								{socials.map(({ href, label, Icon }) => (
									<a
										key={label}
										href={href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={label}
										className={link}
									>
										<Icon className="size-8" />
									</a>
								))}
							</div>
						</>
					)}
					{contact.location && (
						<>
							<p className={`${heading} mt-4`}>{translate('common.footerOffice')}</p>
							<a
								href={contact.location.mapsUrl}
								target="_blank"
								rel="noopener noreferrer"
								className={`max-w-64 text-lg font-medium ${link}`}
							>
								{contact.location.address}
							</a>
						</>
					)}
				</div>
			</div>

			<div className="mx-auto mt-14 flex max-w-7xl flex-col gap-4 border-t border-white/25 pt-6 text-sm font-medium sm:flex-row sm:items-center sm:justify-between">
				<p>
					© {new Date().getFullYear()} {brand.name}
				</p>
				<nav className="flex flex-wrap gap-x-10 gap-y-2">
					<Link href={localizePath('/privacy', locale)} className={link}>
						{translate('legal.privacy.title')}
					</Link>
					<Link href={localizePath('/terms', locale)} className={link}>
						{translate('legal.terms.title')}
					</Link>
				</nav>
			</div>
		</footer>
	);
}
