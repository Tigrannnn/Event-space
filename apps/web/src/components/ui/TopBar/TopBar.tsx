'use client';

import { Mail, Phone, Instagram, MapPin } from 'lucide-react';
import { useTranslation } from '@/hooks/translation';
import { useBrand } from '@/providers/BrandProvider';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher/LanguageSwitcher';
import { useModalStore } from '@/stores/modalStore/modalStore';
import { ContactType, ModalType } from '@/stores/modalStore/types';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';

export default function TopBar({ isTopBarVisible }: { isTopBarVisible: boolean }) {
	const translate = useTranslation();
	const { contact } = useBrand();
	const { openModal } = useModalStore();
	const navigation = useLocalizedNavigation();

	const handleOpenContact = (type: ContactType, value: string) => {
		openModal(ModalType.ContactInfo, { type, value });
	};

	return (
		<div
			className={`from-primary to-accent overflow-hidden bg-linear-to-r px-2 transition-[max-height,padding,opacity,border-width] duration-500 ease-in-out sm:px-2 ${
				isTopBarVisible
					? 'max-h-12 border-b border-white/10 py-1 opacity-100 sm:py-2'
					: 'max-h-0 border-b-0 py-0 opacity-0 sm:py-0'
			}`}
		>
			<div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="flex items-center gap-4 sm:gap-6">
					{contact.instagram && (
						<button
							onClick={() => handleOpenContact(ContactType.Instagram, contact.instagram as string)}
							className="group flex items-center gap-1 text-white transition-all duration-200 hover:text-white/80 sm:gap-1.5"
							aria-label={translate('header.visitInstagram')}
							type="button"
						>
							<Instagram className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
						</button>
					)}

					{contact.phone && (
						<button
							onClick={() => handleOpenContact(ContactType.Phone, contact.phone as string)}
							className="flex items-center gap-1 text-white transition-all duration-200 hover:text-white/80 sm:gap-1.5"
							aria-label={`Call ${contact.phone}`}
							type="button"
						>
							<Phone className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
						</button>
					)}

					{contact.email && (
						<button
							onClick={() => handleOpenContact(ContactType.Email, contact.email as string)}
							className="flex items-center gap-1 text-white transition-all duration-200 hover:text-white/80 sm:gap-1.5"
							aria-label={`Email ${contact.email}`}
							type="button"
						>
							<Mail className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
						</button>
					)}

					{contact.location && (
						<button
							onClick={() => handleOpenContact(ContactType.Location, contact.location!.address)}
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
