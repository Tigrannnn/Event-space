'use client';

import { FormEvent, useMemo, useState, useEffect } from 'react';
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
import { useCancelBooking } from '@/features/bookings/hooks/useBookings';
import { bookingApi } from '@/features/bookings/api/bookings.api';
import CancellationPolicyInfo from '@/components/shared/CancellationPolicyInfo';
import { defaultLocale, Locale, localizePath } from '@/lib/i18n/config';
import { useTranslation } from '@/hooks/translation';
import { useApiError } from '@/hooks/apiError';
import { useParams } from 'next/navigation';
import { useFormatCurrency } from '@/hooks/format';
import { useFormatDate } from '@/hooks/format/useFormatDate';
import { getEventTranslation } from '@event-space/shared';

interface StripePaymentFormProps {
	event: Event;
	booking: BookingWithEstimate;
	onClose: () => void;
	clientSecret: string;
	selectedOccurrence: EventOccurrence | null;
}

type ConfirmationResult =
	{ status: 'confirmed'; booking: Booking } | { status: 'cancelled' } | { status: 'timeout' };

function StripePaymentFormContent({
	event,
	booking,
	onClose,
	selectedOccurrence,
}: Omit<StripePaymentFormProps, 'clientSecret'>) {
	const stripe = useStripe();
	const elements = useElements();
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const translate = useTranslation();
	const apiError = useApiError();
	const locale = translate.locale;
	const { formatDateTime } = useFormatDate();
	const formatCurrency = useFormatCurrency();
	const params = useParams();
	const { mutateAsync: cancelBooking } = useCancelBooking();
	const { openModal } = useModalStore();
	const [isProcessing, setIsProcessing] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);
	const [hasSubmittedPayment, setHasSubmittedPayment] = useState(false);
	const eventTitle = getEventTranslation(event, locale).title;

	const occurrenceDate = selectedOccurrence?.date;

	const waitForConfirmation = async (): Promise<ConfirmationResult> => {
		for (let i = 0; i < 15; i++) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			const updated = await bookingApi.getBooking(booking.id);

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
				return_url: `${window.location.origin}${localizePath('/bookings', locale)}?payment=success`,
			},
			redirect: 'if_required',
		});

		if (error) {
			setIsProcessing(false);
			addToast(apiError(error, 'booking.paymentFailed'), ToastType.ERROR);
			return;
		}

		setHasSubmittedPayment(true);
		addToast(translate('booking.paymentSubmitted'), ToastType.INFO);

		await bookingApi.reconcilePayment(booking.id).catch(() => {
			// best-effort reconcile; webhook or polling can still complete later
		});

		const result = await waitForConfirmation();
		setIsProcessing(false);

		switch (result.status) {
			case 'confirmed':
				await invalidateAfterResolution();
				addToast(translate('booking.paymentConfirmed'), ToastType.SUCCESS);
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

	const handleClose = async () => {
		if (isProcessing) {
			addToast(translate('booking.paymentInProgress'), ToastType.INFO);
			return;
		}
		if (!hasSubmittedPayment) {
			setIsCancelling(true);
			try {
				await cancelBooking(booking.id, {
					onSuccess: async () => {
						await invalidateAfterResolution();
					},
					onError: async () => {
						await invalidateAfterResolution();
					},
				});
			} catch {
				// ignore cancellation failure on modal close
			} finally {
				setIsCancelling(false);
			}
		}

		onClose();
	};

	// Try to cancel pending booking on page unload/visibility change.
	// Note: browsers may not wait for async calls on unload; server-side TTL is recommended as a fallback.
	useEffect(() => {
		const tryCancel = () => {
			if (hasSubmittedPayment) return;
			// best-effort: fire-and-forget cancellation
			cancelBooking(booking.id).catch(() => {
				/* ignore */
			});
		};

		const onBeforeUnload = () => {
			tryCancel();
		};

		const onVisibilityChange = () => {
			if (document.visibilityState === 'hidden') {
				tryCancel();
			}
		};

		window.addEventListener('beforeunload', onBeforeUnload);
		document.addEventListener('visibilitychange', onVisibilityChange);

		return () => {
			window.removeEventListener('beforeunload', onBeforeUnload);
			document.removeEventListener('visibilitychange', onVisibilityChange);
		};
	}, [booking.id, hasSubmittedPayment, cancelBooking]);

	// Auto-close after 1 hour as a fallback in case user leaves page open without completing payment
	useEffect(() => {
		const timer = setTimeout(
			() => {
				handleClose();
				addToast(translate('booking.bookingExpired'), ToastType.ERROR);
			},
			60 * 60 * 1000,
		);

		return () => clearTimeout(timer);
	}, []);

	return (
		<form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
			<ModalHeader title={translate('booking.completePayment')} onClose={handleClose} />

			<p className="text-sm text-gray-500 dark:text-gray-400">{translate('booking.cardDetails')}</p>

			{selectedOccurrence && (
				<div className="space-y-1 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
					<p className="text-sm font-semibold text-gray-900 dark:text-white">{eventTitle}</p>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{formatDateTime(selectedOccurrence.date)}
					</p>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						{translate('booking.spots')}: <span className="font-medium">{booking.quantity}</span>
					</p>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						{translate('booking.total')}:{' '}
						<span className="font-medium">{formatCurrency(booking.amount)}</span>
					</p>
				</div>
			)}

			<div className="bg-gray-100 p-4 dark:bg-gray-800">
				<p>
					{translate('booking.amount')}:{' '}
					<span className="font-medium">{formatCurrency(booking.amount)}</span>
				</p>
				<p>
					{translate('booking.quantity')}: <span className="font-medium">{booking.quantity}</span>
				</p>
			</div>

			<CancellationPolicyInfo
				eventDate={occurrenceDate ?? ''}
				price={event.price}
				cancellationRules={event.cancellationRules ?? []}
				booking={booking}
			/>

			<div className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
				<PaymentElement />
			</div>

			<div className="flex gap-3">
				<Button
					type="button"
					variant="secondary"
					onClick={handleClose}
					isLoading={isCancelling}
					disabled={isProcessing || isCancelling}
					className="flex-1"
				>
					{translate('booking.cancel')}
				</Button>
				<Button
					type="submit"
					isLoading={isProcessing}
					disabled={!stripe || !elements || isProcessing || isCancelling}
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
			/>
		</Elements>
	);
}
