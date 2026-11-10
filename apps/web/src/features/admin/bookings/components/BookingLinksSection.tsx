'use client';

import { Copy } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/clipboard';
import { useTranslation } from '@/hooks/translation';
import { useBookingLinks } from '../../hooks/useAdmin';

export function BookingLinksSection({ bookingId }: { bookingId: string }) {
	const translate = useTranslation();
	const copyToClipboard = useCopyToClipboard();
	const { data } = useBookingLinks(bookingId);

	const links = [
		{ url: data?.bookingUrl, label: translate('booking.adminBookingLink'), copied: 'booking.adminBookingLinkCopied' },
		{ url: data?.reviewUrl, label: translate('booking.adminReviewLink'), copied: 'booking.adminReviewLinkCopied' },
	] as const;
	const available = links.filter((link) => Boolean(link.url));

	if (available.length === 0) return null;

	return (
		<section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950">
			<p className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
				{translate('booking.adminLinksTitle')}
			</p>
			<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{translate('booking.adminLinksHint')}</p>
			<div className="mt-3 space-y-2">
				{available.map((link) => (
					<div key={link.copied} className="flex items-center gap-2 rounded-xl bg-gray-100 p-2 dark:bg-gray-800">
						<span className="shrink-0 text-[0.65rem] font-medium text-gray-500 uppercase dark:text-gray-400">
							{link.label}
						</span>
						<code className="min-w-0 flex-1 truncate font-mono text-[0.7rem] text-gray-700 dark:text-gray-300">
							{link.url}
						</code>
						<button
							type="button"
							onClick={() => void copyToClipboard(link.url as string, link.copied)}
							className="shrink-0 cursor-pointer rounded px-1.5 py-1 text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
							title={translate('booking.adminCopyLink')}
							aria-label={translate('booking.adminCopyLink')}
						>
							<Copy className="h-3 w-3" />
						</button>
					</div>
				))}
			</div>
		</section>
	);
}
