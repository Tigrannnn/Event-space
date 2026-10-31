'use client';

import type { ComponentType } from 'react';
import { Facebook, Mail, MessageCircle, Send, Twitter } from 'lucide-react';
import { useModalStore, useModalData } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';
import { useCopyToClipboard } from '@/hooks/clipboard';
import { useTranslation } from '@/hooks/translation';
import Modal from '../Modal';
import Button from '../../Buttons/Button';

interface ShareTarget {
	name: string;
	icon: ComponentType<{ className?: string }>;
	href: (url: string, title: string) => string;
}

const TARGETS: ShareTarget[] = [
	{
		name: 'Telegram',
		icon: Send,
		href: (url, title) =>
			`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
	},
	{
		name: 'WhatsApp',
		icon: MessageCircle,
		href: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
	},
	{
		name: 'Viber',
		icon: MessageCircle,
		href: (url, title) => `viber://forward?text=${encodeURIComponent(`${title} ${url}`)}`,
	},
	{
		name: 'Facebook',
		icon: Facebook,
		href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
	},
	{
		name: 'X',
		icon: Twitter,
		href: (url, title) =>
			`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
	},
	{
		name: 'Email',
		icon: Mail,
		href: (url, title) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
	},
];

export default function ShareModal() {
	const { closeModal } = useModalStore();
	const data = useModalData(ModalType.Share);
	const translate = useTranslation();
	const copyToClipboard = useCopyToClipboard();

	if (!data) return null;

	return (
		<Modal ariaLabel={translate('event.share')} onClose={closeModal} size="sm" position="center">
			<div className="rounded-2xl bg-white p-5 shadow-xl sm:p-6 dark:bg-gray-800 neutral:rounded-none neutral:bg-transparent neutral:shadow-none neutral:dark:bg-transparent">
				<h3 className="text-primary neutral:text-gray-900 neutral:dark:text-white mb-1 text-center text-xl font-black neutral:font-bold">
					{translate('event.shareTitle')}
				</h3>
				<p className="mb-5 truncate text-center text-sm text-gray-600 dark:text-gray-300">{data.title}</p>

				<div className="mb-5 grid grid-cols-3 gap-2">
					{TARGETS.map(({ name, icon: Icon, href }) => (
						<a
							key={name}
							href={href(data.url, data.title)}
							target="_blank"
							rel="noopener noreferrer"
							onClick={closeModal}
							className="hover:border-primary flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 px-2 py-3 text-xs font-medium text-gray-700 transition-colors dark:border-gray-700 dark:text-gray-200 neutral:rounded-lg neutral:border-gray-300 neutral:dark:border-neutral-700"
						>
							<Icon className="text-primary size-5" />
							{name}
						</a>
					))}
				</div>

				<div className="mb-5 overflow-hidden rounded-xl bg-gray-100 p-3 text-center font-mono text-xs break-all dark:bg-gray-700 dark:text-gray-200 neutral:border neutral:border-gray-200 neutral:bg-gray-50 neutral:dark:border-neutral-700 neutral:dark:bg-neutral-800">
					{data.url}
				</div>

				<div className="flex flex-col gap-3 sm:flex-row">
					<Button variant="secondary" onClick={closeModal} className="sm:flex-1">
						{translate('common.close')}
					</Button>
					<Button
						variant="primary"
						type="button"
						onClick={async () => {
							if (await copyToClipboard(data.url, 'event.linkCopied', 'event.copyFailed')) closeModal();
						}}
						className="sm:flex-1"
					>
						{translate('event.copyLink')}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
