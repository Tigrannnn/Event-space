'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@/components/ui/Buttons/Button';
import { ModalHeader } from '@/components/ui/Modal';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { ModalType, useModalStore } from '@/stores/modalStore';
import {
	Booking,
	BookingWithEstimate,
	EnvKey,
	Event,
	type EventOccurrence,
} from '@event-space/shared';
import { clientEnv } from '@/config/env';
import useSystemTheme from '@/hooks/systemTheme';
import { bookingApi } from '@/features/bookings/api/bookings.api';
import PaymentSummary from '@/features/bookings/components/PaymentSummary';
import CancellationPolicyInfo from '@/components/shared/CancellationPolicyInfo';
import { defaultLocale, Locale, localizePath } from '@/lib/i18n/config';
import { useTranslation } from '@/hooks/translation';
import { useApiError } from '@/hooks/apiError';
import { useParams } from 'next/navigation';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { rememberGuestEmail } from './GuestBookingNotice';
import { useFormatCurrency } from '@/hooks/format';
import { useFormatDate } from '@/hooks/format/useFormatDate';
import { getEventTranslation } from '@event-space/shared';

interface StripePaymentFormProps {
	event: Event;
	booking: BookingWithEstimate;
	onClose: () => void;
	clientSecret: string;
	selectedOccurrence: EventOccurrence | null;
	/** Someone paying without an account: the key to their booking, and the email it went to. */
	guestAccess?: { token: string; email: string };
}

type ConfirmationResult =
	{ status: 'confirmed'; booking: Booking } | { status: 'cancelled' } | { status: 'timeout' };

function StripePaymentFormContent({
	event,
	booking,
	onClose,
	selectedOccurrence,
	guestAccess,
}: Omit<StripePaymentFormProps, 'clientSecret'>) {
	const stripe = useStripe();
	const elements = useElements();
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const translate = useTranslation();
	const apiError = useApiError();
	const locale = translate.locale;
	const { formatDateTimeZone } = useFormatDate();
	const formatCurrency = useFormatCurrency();
	const params = useParams();
	const { openModal } = useModalStore();
	const navigation = useLocalizedNavigation();
	const [isProcessing, setIsProcessing] = useState(false);
	const eventTitle = getEventTranslation(event, locale).title;

	const occurrenceDate = selectedOccurrence?.date;

	const waitForConfirmation = async (): Promise<ConfirmationResult> => {
		for (let i = 0; i < 15; i++) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			const updated = await bookingApi.getBooking(booking.id, guestAccess?.token);

			if (updated.status === 'CONFIRMED') {
				return { status: 'confirmed', booking: updated };
			}

			if (updated.status === 'CANCELLED') {
				return { status: 'cancelled' };
			}
		}

		return { status: 'timeout' };
	};

	const invalidateAfterResolution = () =>
		Promise.all([
			queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
			queryClient.invalidateQueries({ queryKey: ['event', event.id] }),
			queryClient.invalidateQueries({ queryKey: ['events'] }),
		]);

	const handleSubmit = async (formEvent: FormEvent) => {
		formEvent.preventDefault();

		if (!stripe || !elements) {
			return;
		}

		setIsProcessing(true);

		const { error } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: guestAccess
					? `${window.location.origin}${localizePath(`/bookings/${booking.id}`, locale)}?t=${encodeURIComponent(guestAccess.token)}&payment=success`
					: `${window.location.origin}${localizePath('/bookings', locale)}?payment=success`,
			},
			redirect: 'if_required',
		});

		if (error) {
			setIsProcessing(false);
			addToast(apiError(error, 'booking.paymentFailed'), ToastType.ERROR);
			return;
		}

		addToast(translate('booking.paymentSubmitted'), ToastType.INFO);

		await bookingApi.reconcilePayment(booking.id, guestAccess?.token).catch(() => {
			// best-effort reconcile; webhook or polling can still complete later
		});

		const result = await waitForConfirmation();
		setIsProcessing(false);

		switch (result.status) {
			case 'confirmed':
				await invalidateAfterResolution();
				addToast(translate('booking.paymentConfirmed'), ToastType.SUCCESS);

				// A guest has no list of bookings to land on: take them to the booking itself, on
				// the link they will find in the letter, so the page they keep is the page they see.
				if (guestAccess) {
					rememberGuestEmail(booking.id, guestAccess.email);
					onClose();
					navigation.push(`/bookings/${booking.id}?t=${encodeURIComponent(guestAccess.token)}`);
					break;
				}

				openModal(ModalType.BookingSuccess, {
					booking: result.booking,
					event,
					occurrence: selectedOccurrence,
				});
				break;

			case 'cancelled':
				addToast(translate('booking.paymentCancelled'), ToastType.ERROR);
				await invalidateAfterResolution();
				onClose();
				break;

			case 'timeout':
				addToast(translate('booking.paymentTimeout'), ToastType.INFO);
				break;
		}
	};

	// Closing the modal leaves the booking PENDING so the user can come back and pay later.
	const handleClose = () => {
		if (isProcessing) {
			addToast(translate('booking.paymentInProgress'), ToastType.INFO);
			return;
		}

		onClose();
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
			<ModalHeader title={translate('booking.completePayment')} onClose={handleClose} />

			<p className="text-sm text-gray-500 dark:text-gray-400">{translate('booking.cardDetails')}</p>

			<PaymentSummary
				title={selectedOccurrence ? eventTitle : undefined}
				date={selectedOccurrence ? formatDateTimeZone(selectedOccurrence.date) : undefined}
				quantity={booking.quantity}
				total={formatCurrency(booking.amount)}
			/>

			<CancellationPolicyInfo
				eventDate={occurrenceDate ?? ''}
				price={event.price}
				cancellationRules={event.cancellationRules ?? []}
				booking={booking}
			/>

			<div className="rounded-md border border-gray-200 p-3 in-data-[skin=listing]:rounded-md in-data-[skin=listing]:border-gray-300 in-data-[skin=market]:rounded-xl in-data-[skin=drawer]:rounded-xl in-data-[skin=market]:border-gray-300 in-data-[skin=drawer]:border-gray-300 in-data-[skin=minimal]:rounded-lg in-data-[skin=minimal]:border-gray-300 in-data-[skin=soft]:rounded-3xl in-data-[skin=soft]:border-0 in-data-[skin=soft]:bg-white in-data-[skin=soft]:p-4 in-data-[skin=soft]:shadow-sm in-data-[skin=soft]:ring-1 in-data-[skin=soft]:ring-black/5 dark:border-gray-700 in-data-[skin=soft]:dark:bg-gray-800 in-data-[skin=soft]:dark:ring-white/10">
				<PaymentElement />
			</div>

			<div className="flex gap-3">
				<Button
					type="button"
					variant="secondary"
					onClick={handleClose}
					disabled={isProcessing}
					className="flex-1"
				>
					{translate('booking.cancel')}
				</Button>
				<Button
					type="submit"
					isLoading={isProcessing}
					disabled={!stripe || !elements || isProcessing}
					className="flex-1"
				>
					{isProcessing ? translate('booking.confirming') : translate('booking.payNow')}
				</Button>
			</div>
		</form>
	);
}

export default function StripePaymentForm({
	event,
	booking,
	onClose,
	clientSecret,
	selectedOccurrence,
	guestAccess,
}: StripePaymentFormProps) {
	const theme = useSystemTheme();
	const publishableKey = clientEnv[EnvKey.STRIPE_PUBLISHABLE_KEY];
	const translate = useTranslation();

	const stripePromise = useMemo(() => {
		if (!publishableKey) {
			return null;
		}

		return loadStripe(publishableKey);
	}, [publishableKey]);

	if (!stripePromise) {
		return (
			<div className="space-y-5 p-5 sm:p-6">
				<ModalHeader title={translate('booking.completePayment')} onClose={onClose} />
				<p className="text-sm text-red-500">{translate('booking.stripeMissing')}</p>
			</div>
		);
	}

	return (
		<Elements
			stripe={stripePromise}
			options={{ clientSecret, appearance: { theme: theme === 'dark' ? 'night' : 'stripe' } }}
		>
			<StripePaymentFormContent
				event={event}
				booking={booking}
				onClose={onClose}
				selectedOccurrence={selectedOccurrence}
				guestAccess={guestAccess}
			/>
		</Elements>
	);
}
