'use client';

import { useState, type ComponentType } from 'react';
import { ChevronDown, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useBrand } from '@/providers/BrandProvider';
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

/**
 * The contacts of the market skin as one tile next to the language tile: it opens a list of the
 * company's channels, each a direct link (profile, call, mail, map) instead of a card of its own.
 */
export default function ContactTile({ className }: { className?: string }) {
	const { contact } = useBrand();
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
						'hover:bg-primary/10 hover:text-primary flex h-10 items-center gap-1.5 rounded-xl bg-gray-100 px-3 text-sm font-semibold text-gray-800 transition-colors dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700',
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
				className="w-72 rounded-xl border-gray-200 bg-white p-1 backdrop-blur-none dark:border-neutral-800 dark:bg-neutral-900"
			>
				{channels.map(({ key, title, value, href, external, Icon }) => (
					<a
						key={key}
						href={href}
						{...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
						onClick={() => setIsOpen(false)}
						className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
					>
						<span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
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
