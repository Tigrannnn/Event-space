'use client';

import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useBrand, useSkin } from '@/providers/BrandProvider';
import { useTranslation } from '@/hooks/translation';
import { useModalStore } from '@/stores/modalStore/modalStore';
import { ContactType, ModalType } from '@/stores/modalStore/types';
import { cn } from '@/utils/cn';
import ContactTile from './ContactTile';

const BARE_LIGHT =
	'rounded-full text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-neutral-800 dark:hover:text-white';
const BARE_DARK = 'rounded-full text-white/85 hover:bg-white/15 hover:text-white';

const LOOK = {
	minimal: { light: BARE_LIGHT, dark: BARE_DARK, stroke: 1.6 },
	listing: {
		light:
			'rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800 dark:hover:text-white',
		dark: 'rounded-md border border-white/40 text-white/85 hover:bg-white/15 hover:text-white',
		stroke: 1.6,
	},
	soft: {
		light: 'bg-primary/10 text-primary hover:bg-primary/20 rounded-full',
		dark: 'rounded-full bg-white/15 text-white hover:bg-white/25',
		stroke: 2,
	},
	market: {
		light:
			'rounded-xl bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700 dark:hover:text-white',
		dark: 'rounded-xl bg-white/15 text-white hover:bg-white/25',
		stroke: 1.75,
	},
	classic: { light: BARE_LIGHT, dark: BARE_DARK, stroke: 1.6 },
} as const;

/** The company's own channels as a row of icons, each opening the contact card on click. */
export default function ContactIcons({
	className,
	onDark = false,
}: {
	className?: string;
	onDark?: boolean;
}) {
	const { contact } = useBrand();
	const skin = useSkin();
	const look = LOOK[skin];
	const translate = useTranslation();
	const { openModal } = useModalStore();

	if (skin === 'market' || skin === 'soft') {
		return <ContactTile onDark={onDark} className={className} />;
	}

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
						'flex size-10 items-center justify-center transition-colors',
						onDark ? look.dark : look.light,
					)}
				>
					<Icon className="size-5" strokeWidth={look.stroke} />
				</button>
			))}
		</div>
	);
}
