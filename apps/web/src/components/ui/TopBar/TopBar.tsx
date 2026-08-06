'use client';

import { Mail, Phone, Instagram, MapPin } from 'lucide-react';
import { COMPANY_CONFIG } from '@/config/сompany';
import { useTranslation } from '@/hooks/translation';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher/LanguageSwitcher';
import { useModalStore } from '@/stores/modalStore/modalStore';
import { ContactType, ModalType } from '@/stores/modalStore/types';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';

export default function TopBar({ isTopBarVisible }: { isTopBarVisible: boolean }) {
	const translate = useTranslation();
	const { openModal } = useModalStore();
	const navigation = useLocalizedNavigation();

	const handleOpenContact = (type: ContactType, value: string) => {
		openModal(ModalType.ContactInfo, { type, value });
	};

	return (
		<div
			className={`from-primary to-accent overflow-hidden bg-linear-to-br px-2 transition-[max-height,padding,opacity,border-width] duration-500 ease-in-out sm:px-2 ${
				isTopBarVisible
					? 'max-h-12 border-b border-white/10 py-1 opacity-100 sm:py-2'
					: 'max-h-0 border-b-0 py-0 opacity-0 sm:py-0'
			}`}
		>
			<div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="flex items-center gap-4 sm:gap-6">
					{COMPANY_CONFIG.instagram && (
						<button
							onClick={() => handleOpenContact(ContactType.Instagram, COMPANY_CONFIG.instagram)}
							className="group flex items-center gap-1 text-white transition-all duration-200 hover:text-white/80 sm:gap-1.5"
							aria-label={translate('header.visitInstagram')}
							type="button"
						>
							<Instagram className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
						</button>
					)}

					{COMPANY_CONFIG.phone && (
						<button
							onClick={() => handleOpenContact(ContactType.Phone, COMPANY_CONFIG.phone)}
							className="flex items-center gap-1 text-white transition-all duration-200 hover:text-white/80 sm:gap-1.5"
							aria-label={`Call ${COMPANY_CONFIG.phone}`}
							type="button"
						>
							<Phone className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
						</button>
					)}

					{COMPANY_CONFIG.email && (
						<button
							onClick={() => handleOpenContact(ContactType.Email, COMPANY_CONFIG.email)}
							className="flex items-center gap-1 text-white transition-all duration-200 hover:text-white/80 sm:gap-1.5"
							aria-label={`Email ${COMPANY_CONFIG.email}`}
							type="button"
						>
							<Mail className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
						</button>
					)}

					{COMPANY_CONFIG.location && (
						<button
							onClick={() =>
								handleOpenContact(ContactType.Location, COMPANY_CONFIG.location.address)
							}
							className="flex items-center gap-1 text-white transition-all duration-200 hover:text-white/80 sm:gap-1.5"
							aria-label={translate('header.viewLocation')}
							type="button"
						>
							<MapPin className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
						</button>
					)}

					<button
						onClick={() => navigation.push('/about')}
						className="text-sm text-white transition-all duration-200 hover:text-white/80"
						type="button"
					>
						{translate('header.aboutUs')}
					</button>
				</div>
				<LanguageSwitcher />
			</div>
		</div>
	);
}
