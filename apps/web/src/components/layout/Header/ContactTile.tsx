'use client';

import { useState, type ComponentType } from 'react';
import { ChevronDown, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useBrand, useSkin } from '@/providers/BrandProvider';
import { useTranslation } from '@/hooks/translation';
import type { MessageKey } from '@/lib/i18n/messages';
import { cn } from '@/utils/cn';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover';

interface Channel {
	key: string;
	title: MessageKey;
	value: string;
	href: string;
	external: boolean;
	Icon: ComponentType<{ className?: string }>;
}

const LOOK = {
	market: {
		trigger:
			'h-10 gap-1.5 rounded-xl px-3 text-sm font-semibold hover:bg-primary/10 hover:text-primary',
		light: 'bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700',
		dark: 'bg-white/15 text-white hover:bg-white/25',
		panel: 'w-72 rounded-xl p-1',
		row: 'rounded-lg px-3 py-2.5',
		icon: 'rounded-lg',
	},
	soft: {
		trigger:
			'h-10 gap-1.5 rounded-full pr-3 pl-4 font-(family-name:--font-display) text-base font-semibold',
		light: 'bg-primary/10 text-primary hover:bg-primary/20',
		dark: 'bg-white/15 text-white hover:bg-white/25',
		panel: 'w-80 rounded-3xl p-2',
		row: 'rounded-2xl px-3 py-3',
		icon: 'rounded-full',
	},
} as const;

/**
 * The contacts of the market and soft skins as one tile next to the language tile: it opens a list of the
 * company's channels, each a direct link (profile, call, mail, map) instead of a card of its own.
 */
export default function ContactTile({
	className,
	onDark = false,
}: {
	className?: string;
	onDark?: boolean;
}) {
	const { contact } = useBrand();
	const look = LOOK[useSkin() === 'soft' ? 'soft' : 'market'];
	const translate = useTranslation();
	const [isOpen, setIsOpen] = useState(false);

	const channels: Channel[] = [];
	if (contact.instagram) {
		channels.push({
			key: 'instagram',
			title: 'header.contactInstagramTitle',
			value: contact.instagram.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
			href: contact.instagram,
			external: true,
			Icon: Instagram,
		});
	}
	if (contact.phone) {
		channels.push({
			key: 'phone',
			title: 'header.contactPhoneTitle',
			value: contact.phone,
			href: `tel:${contact.phone.replace(/\s/g, '')}`,
			external: false,
			Icon: Phone,
		});
	}
	if (contact.email) {
		channels.push({
			key: 'email',
			title: 'header.contactEmailTitle',
			value: contact.email,
			href: `mailto:${contact.email}`,
			external: false,
			Icon: Mail,
		});
	}
	if (contact.location) {
		channels.push({
			key: 'location',
			title: 'header.contactLocationTitle',
			value: contact.location.address,
			href: contact.location.mapsUrl,
			external: true,
			Icon: MapPin,
		});
	}

	if (channels.length === 0) return null;

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={translate('header.contactUs')}
					className={cn(
						'inline-flex items-center transition-colors',
						look.trigger,
						onDark ? look.dark : look.light,
						className,
					)}
				>
					<Phone className="size-4" />
					<span className="hidden sm:inline">{translate('header.contactUs')}</span>
					<ChevronDown className={cn('size-3.5 transition-transform', isOpen && 'rotate-180')} />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className={cn(
					'border-gray-200 bg-white backdrop-blur-none dark:border-neutral-800 dark:bg-neutral-900',
					look.panel,
				)}
			>
				{channels.map(({ key, title, value, href, external, Icon }) => (
					<a
						key={key}
						href={href}
						{...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
						onClick={() => setIsOpen(false)}
						className={cn(
							'flex items-center gap-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800',
							look.row,
						)}
					>
						<span className={cn(
							'bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center',
							look.icon,
						)}>
							<Icon className="size-4.5" />
						</span>
						<span className="min-w-0">
							<span className="block text-sm font-semibold text-gray-900 dark:text-white">
								{translate(title)}
							</span>
							<span className="block truncate text-xs text-gray-500 dark:text-gray-400">{value}</span>
						</span>
					</a>
				))}
			</PopoverContent>
		</Popover>
	);
}
