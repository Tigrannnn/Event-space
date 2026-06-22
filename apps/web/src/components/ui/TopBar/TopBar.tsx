'use client';

import Link from 'next/link';
import { Mail, Phone, Instagram } from 'lucide-react';
import { COMPANY_CONFIG } from '@/config/сompany';
import { useTranslation } from '@/hooks/translation';

export default function TopBar({ isTopBarVisible }: { isTopBarVisible: boolean }) {
	const translate = useTranslation();

	return (
		<div
			className={`from-primary to-accent overflow-hidden bg-linear-to-br px-2 transition-[max-height,padding,opacity,border-width] duration-500 ease-in-out sm:px-2 ${
				isTopBarVisible
					? 'max-h-12 border-b border-white/10 py-1 opacity-100 sm:py-2'
					: 'max-h-0 border-b-0 py-0 opacity-0 sm:py-0'
			}`}
		>
			<div className="mx-auto flex h-full items-center justify-end gap-4 px-4 sm:gap-6 sm:px-6 lg:px-8">
				{COMPANY_CONFIG.instagram && (
					<Link
						href={COMPANY_CONFIG.instagram}
						target="_blank"
						rel="noopener noreferrer"
						className="group flex items-center gap-1 text-white transition-all duration-200 hover:text-white/80 sm:gap-1.5"
						aria-label={translate('header.visitInstagram')}
					>
						<Instagram className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
					</Link>
				)}

				{COMPANY_CONFIG.phone && (
					<a
						href={`tel:${COMPANY_CONFIG.phone.replace(/\s/g, '')}`}
						className="flex items-center gap-1 text-white transition-all duration-200 hover:text-white/80 sm:gap-1.5"
						aria-label={`Call ${COMPANY_CONFIG.phone}`}
					>
						<Phone className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
						<span className="text-xs font-medium">{COMPANY_CONFIG.phone}</span>
					</a>
				)}

				{COMPANY_CONFIG.email && (
					<a
						href={`mailto:${COMPANY_CONFIG.email}`}
						className="flex items-center gap-1 text-white transition-all duration-200 hover:text-white/80 sm:gap-1.5"
						aria-label={`Email ${COMPANY_CONFIG.email}`}
					>
						<Mail className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
						<span className="text-xs font-medium">{COMPANY_CONFIG.email}</span>
					</a>
				)}
			</div>
		</div>
	);
}
