'use client';

import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useBrand } from '@/providers/BrandProvider';
import { useTranslation } from '@/hooks/translation';
import { useModalStore } from '@/stores/modalStore/modalStore';
import { ContactType, ModalType } from '@/stores/modalStore/types';
import { cn } from '@/utils/cn';

/** The company's own channels as a row of icons, each opening the contact card on click. */
export default function ContactIcons({
	className,
	onDark = false,
}: {
	className?: string;
	onDark?: boolean;
}) {
	const { contact } = useBrand();
	const translate = useTranslation();
	const { openModal } = useModalStore();

	const items = [
		contact.instagram && {
			type: ContactType.Instagram,
			value: contact.instagram,
			label: translate('header.visitInstagram'),
			Icon: Instagram,
		},
		contact.phone && {
			type: ContactType.Phone,
			value: contact.phone,
			label: contact.phone,
			Icon: Phone,
		},
		contact.email && {
			type: ContactType.Email,
			value: contact.email,
			label: contact.email,
			Icon: Mail,
		},
		contact.location && {
			type: ContactType.Location,
			value: contact.location.address,
			label: translate('header.viewLocation'),
			Icon: MapPin,
		},
	].filter((item): item is Exclude<typeof item, '' | undefined> => typeof item === 'object');

	return (
		<div className={cn('flex items-center gap-1', className)}>
			{items.map(({ type, value, label, Icon }) => (
				<button
					key={type}
					type="button"
					onClick={() => openModal(ModalType.ContactInfo, { type, value })}
					aria-label={label}
					title={label}
					className={cn(
						'flex size-10 items-center justify-center rounded-full transition-colors',
						onDark
							? 'text-white/85 hover:bg-white/15 hover:text-white'
							: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-neutral-800 dark:hover:text-white',
					)}
				>
					<Icon className="size-5" strokeWidth={1.6} />
				</button>
			))}
		</div>
	);
}
