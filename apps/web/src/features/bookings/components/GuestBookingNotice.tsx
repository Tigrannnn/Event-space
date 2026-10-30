'use client';

import { useState } from 'react';
import { Copy, Mail, Send } from 'lucide-react';
import Button from '@/components/ui/Buttons/Button';
import { useCopyToClipboard } from '@/hooks/clipboard';
import { useTranslation } from '@/hooks/translation';
import { localizePath } from '@/lib/i18n/config';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { bookingApi } from '../api/bookings.api';

const EMAIL_KEY_PREFIX = 'guest-booking-email:';

/**
 * Where the letter went is only known on the page that took the booking, and the link to the
 * booking page must not carry an address. It is passed across the redirect in this tab's
 * session storage, which a private window or blocked storage may refuse: the page then just
 * says "the letter" without the address.
 */
export function rememberGuestEmail(bookingId: string, email: string): void {
	try {
		sessionStorage.setItem(EMAIL_KEY_PREFIX + bookingId, email);
	} catch {
		// the notice falls back to a generic text
	}
}

export function recallGuestEmail(bookingId: string): string | undefined {
	try {
		return sessionStorage.getItem(EMAIL_KEY_PREFIX + bookingId) ?? undefined;
	} catch {
		return undefined;
	}
}

interface GuestBookingNoticeProps {
	bookingId: string;
	accessToken: string;
	/** Where the letter went, when the page knows it (right after paying). */
	email?: string;
}

/**
 * What a booking made without an account has to say loudly: the letter is the ticket. It
 * explains that, lets the guest keep the link to the booking by hand and send the letter again,
 * so a missed or lost email is not the end of the booking.
 */
export default function GuestBookingNotice({
	bookingId,
	accessToken,
	email,
}: GuestBookingNoticeProps) {
	const translate = useTranslation();
	const copyToClipboard = useCopyToClipboard();
	const { addToast } = useToastStore();
	const [isSending, setIsSending] = useState(false);

	const handleCopyLink = () => {
		const link = `${window.location.origin}${localizePath(`/bookings/${bookingId}`, translate.locale)}?t=${encodeURIComponent(accessToken)}`;
		void copyToClipboard(link, 'booking.guestLinkCopied');
	};

	const handleResend = async () => {
		setIsSending(true);

		try {
			const { sent } = await bookingApi.resendConfirmation(bookingId, accessToken);
			addToast(
				translate(sent ? 'booking.guestResent' : 'booking.guestResendFailed'),
				sent ? ToastType.SUCCESS : ToastType.ERROR,
			);
		} catch {
			addToast(translate('booking.guestResendFailed'), ToastType.ERROR);
		} finally {
			setIsSending(false);
		}
	};

	return (
		<div className="rounded-xl bg-amber-50 p-4 text-left dark:bg-amber-950/30">
			<p className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
				<Mail className="h-4 w-4 shrink-0" />
				{translate('booking.guestSuccessTitle')}
			</p>
			<p className="mt-2 text-sm text-amber-900/90 dark:text-amber-100/90">
				{email ? translate('booking.guestSuccessText', { email }) : translate('booking.guestPageHint')}
			</p>
			<div className="mt-3 flex flex-col gap-2 sm:flex-row">
				<Button type="button" variant="secondary" size="sm" className="flex-1" onClick={handleCopyLink}>
					<Copy className="h-4 w-4" />
					{translate('booking.guestCopyLink')}
				</Button>
				<Button
					type="button"
					variant="secondary"
					size="sm"
					className="flex-1"
					onClick={() => void handleResend()}
					isLoading={isSending}
				>
					<Send className="h-4 w-4" />
					{translate('booking.guestResend')}
				</Button>
			</div>
		</div>
	);
}
