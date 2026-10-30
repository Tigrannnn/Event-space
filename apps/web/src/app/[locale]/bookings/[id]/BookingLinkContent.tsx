'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Buttons/Button';
import BookingLinkSkeleton from './BookingLinkSkeleton';
import BookingCard from '@/features/bookings/components/BookingCard';
import GuestBookingNotice, {
	recallGuestEmail,
} from '@/features/bookings/components/GuestBookingNotice';
import { bookingApi } from '@/features/bookings/api/bookings.api';
import { useBookingView } from '@/features/bookings/hooks/useBookings';
import { useCurrentUser } from '@/features/users';
import { useTranslation } from '@/hooks/translation';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useModalStore } from '@/stores';
import { ModalType } from '@/stores/modalStore';

/**
 * One booking behind the link in its email, for someone who has no account (or has one and is
 * not signed in). The link is the key: it shows the booking, its QR, lets the guest cancel and
 * leads on to the review form.
 */
export default function BookingLinkContent({ bookingId }: { bookingId: string }) {
	const searchParams = useSearchParams();
	const token = searchParams.get('t') ?? undefined;
	const isReturningFromPayment = searchParams.get('payment') === 'success';
	const translate = useTranslation();
	const navigation = useLocalizedNavigation();
	const queryClient = useQueryClient();
	const { openModal } = useModalStore();
	const { data: user } = useCurrentUser();
	const [guestEmail] = useState(() => recallGuestEmail(bookingId));
	const {
		data: booking,
		isLoading,
		isError,
		refetch,
		isFetching,
	} = useBookingView(bookingId, token);

	const isAwaitingPayment = isReturningFromPayment && booking?.status === 'PENDING';

	// A card that sent the guest away to confirm the payment brings them back here before the
	// server has heard about it: ask once, then keep looking until it is confirmed.
	useEffect(() => {
		if (!isReturningFromPayment) return;

		void bookingApi
			.reconcilePayment(bookingId, token)
			.catch(() => undefined)
			.finally(() => queryClient.invalidateQueries({ queryKey: ['booking-view', bookingId] }));
	}, [bookingId, isReturningFromPayment, queryClient, token]);

	useEffect(() => {
		if (!isAwaitingPayment) return;

		const timer = window.setInterval(() => void refetch(), 2000);
		return () => window.clearInterval(timer);
	}, [isAwaitingPayment, refetch]);

	if (isLoading) {
		return <BookingLinkSkeleton />;
	}

	if (isError || !booking) {
		return (
			<div className="mx-auto w-full max-w-xl px-4 py-10">
				<div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
					<AlertTriangle className="h-10 w-10" />
					<p className="font-semibold text-gray-800 dark:text-gray-100">
						{translate('booking.guestLinkInvalid')}
					</p>
					<p className="text-sm">{translate('booking.guestLinkInvalidHint')}</p>
					<div className="flex flex-col gap-3 sm:flex-row">
						<Button onClick={() => void refetch()} isLoading={isFetching}>
							{translate('review.retry')}
						</Button>
						<Button variant="secondary" onClick={() => navigation.push('/bookings')}>
							{translate('review.backToBookings')}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-xl px-4 py-8">
			<h1 className="text-primary mb-2 text-2xl font-black sm:text-3xl">
				{translate('booking.guestPageTitle')}
			</h1>
			{isAwaitingPayment && (
				<p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
					{translate('booking.guestPaymentChecking')}
				</p>
			)}

			<BookingCard booking={booking} accessToken={token} />

			{token && booking.status === 'CONFIRMED' && (
				<div className="mt-6">
					<GuestBookingNotice bookingId={bookingId} accessToken={token} email={guestEmail} />
				</div>
			)}

			{!user && (
				<div className="mt-6 rounded-2xl border border-gray-200 p-5 dark:border-gray-700">
					<p className="font-semibold text-gray-900 dark:text-white">
						{translate('booking.guestCreateAccountTitle')}
					</p>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						{translate('booking.guestCreateAccountHint')}
					</p>
					<Button variant="secondary" className="mt-4" onClick={() => openModal(ModalType.Register)}>
						{translate('booking.guestCreateAccount')}
					</Button>
				</div>
			)}
		</div>
	);
}
