'use client';

import { FormEvent, useMemo, useState, useEffect } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@/components/ui/Buttons/Button';
import { ModalHeader } from '@/components/ui/Modal';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { BookingWithEstimate, EnvKey, Event, getApiErrorMessage } from '@event-space/shared';
import { clientEnv } from '@/config/env';
import useSystemTheme from '@/hooks/systemTheme';
import { useCancelBooking } from '@/features/bookings/hooks/useBookings';
import { bookingApi } from '@/features/bookings/api/bookings.api';
import CancellationPolicyInfo from '@/components/shared/CancellationPolicyInfo';

interface StripePaymentFormProps {
	event: Event;
	booking: BookingWithEstimate;
	onClose: () => void;
	clientSecret: string;
}

type ConfirmationResult = 'confirmed' | 'cancelled' | 'timeout';

function StripePaymentFormContent({
	event,
	booking,
	onClose,
}: Omit<StripePaymentFormProps, 'clientSecret'>) {
	const stripe = useStripe();
	const elements = useElements();
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { mutateAsync: cancelBooking } = useCancelBooking();
	const [isProcessing, setIsProcessing] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);
	const [hasSubmittedPayment, setHasSubmittedPayment] = useState(false);

	const waitForConfirmation = async (): Promise<ConfirmationResult> => {
		for (let i = 0; i < 15; i++) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			const updated = await bookingApi.getBooking(booking.id);

			if (updated.status === 'CONFIRMED') {
				return 'confirmed';
			}

			if (updated.status === 'CANCELLED') {
				return 'cancelled';
			}
		}

		return 'timeout';
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
				return_url: `${window.location.origin}/bookings?payment=success`,
			},
			redirect: 'if_required',
		});

		if (error) {
			setIsProcessing(false);
			addToast(getApiErrorMessage(error, 'Payment failed. Please try again.'), ToastType.ERROR);
			return;
		}

		setHasSubmittedPayment(true);
		addToast('Payment submitted. Waiting for confirmation...', ToastType.INFO);

		const result = await waitForConfirmation();
		setIsProcessing(false);

		switch (result) {
			case 'confirmed':
				addToast('Payment confirmed! Your booking is complete.', ToastType.SUCCESS);
				await invalidateAfterResolution();
				onClose();
				break;

			case 'cancelled':
				addToast(
					'Your booking could not be completed. If you were charged, you will be refunded automatically.',
					ToastType.ERROR,
				);
				await invalidateAfterResolution();
				onClose();
				break;

			case 'timeout':
				addToast('Payment is taking longer than expected. Check your bookings later.', ToastType.INFO);
				break;
		}
	};

	const handleClose = async () => {
		if (!hasSubmittedPayment) {
			setIsCancelling(true);
			try {
				await cancelBooking(booking.id);
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
				addToast('Booking expired due to inactivity. Please try again.', ToastType.ERROR);
			},
			60 * 60 * 1000,
		);

		return () => clearTimeout(timer);
	}, []);

	return (
		<form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
			<ModalHeader title="Complete payment" onClose={handleClose} />

			<p className="text-sm text-gray-500 dark:text-gray-400">
				Enter your card details to confirm the booking.
			</p>

			<div className="bg-gray-100 p-4 dark:bg-gray-800">
				<p>
					Amount: <span className="font-medium">${Number(booking.amount).toFixed(2)}</span>
				</p>
				<p>
					Quantity: <span className="font-medium">{booking.quantity}</span>
				</p>
			</div>

			<CancellationPolicyInfo
				eventDate={event.date}
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
					Cancel
				</Button>
				<Button
					type="submit"
					isLoading={isProcessing}
					disabled={!stripe || !elements || isProcessing || isCancelling}
					className="flex-1"
				>
					{isProcessing ? 'Confirming...' : 'Pay now'}
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
}: StripePaymentFormProps) {
	const theme = useSystemTheme();
	const publishableKey = clientEnv[EnvKey.STRIPE_PUBLISHABLE_KEY];

	const stripePromise = useMemo(() => {
		if (!publishableKey) {
			return null;
		}

		return loadStripe(publishableKey);
	}, [publishableKey]);

	if (!stripePromise) {
		return (
			<div className="space-y-5 p-5 sm:p-6">
				<ModalHeader title="Complete payment" onClose={onClose} />
				<p className="text-sm text-red-500">
					Stripe is not configured properly. Please contact support.
				</p>
			</div>
		);
	}

	return (
		<Elements
			stripe={stripePromise}
			options={{ clientSecret, appearance: { theme: theme === 'dark' ? 'night' : 'stripe' } }}
		>
			<StripePaymentFormContent event={event} booking={booking} onClose={onClose} />
		</Elements>
	);
}
