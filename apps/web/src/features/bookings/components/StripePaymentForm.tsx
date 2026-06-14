'use client';

import { FormEvent, useMemo, useState, useEffect } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@/components/ui/Buttons/Button';
import { ModalHeader } from '@/components/ui/Modal';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { BookingWithEstimate, EnvKey, getApiErrorMessage } from '@event-space/shared';
import { clientEnv } from '@/config/env';
import useSystemTheme from '@/hooks/systemTheme';
import { useCancelBooking } from '@/features/bookings/hooks/useBookings';
import { bookingApi } from '@/features/bookings/api/bookings.api';

interface StripePaymentFormProps {
	eventId: string;
	bookingId?: string | null;
	onClose: () => void;
	clientSecret: string;
}

function StripePaymentFormContent({
	eventId,
	onClose,
	bookingId,
}: Omit<StripePaymentFormProps, 'clientSecret'>) {
	const stripe = useStripe();
	const elements = useElements();
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const { mutateAsync: cancelBooking } = useCancelBooking();
	const [isProcessing, setIsProcessing] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);
	const [hasSubmittedPayment, setHasSubmittedPayment] = useState(false);

	// Estimate commission and refund using cached event/booking data

	const bookingCache = bookingId
		? queryClient
				.getQueryData<BookingWithEstimate[]>(['my-bookings'])
				?.find((b) => b.id === bookingId)
		: null;

	const formatCents = (cents: number) => (cents / 100).toFixed(2);

	const waitForConfirmation: () => Promise<'confirmed' | 'no_spots_left' | 'timeout'> = async () => {
		if (!bookingId) return 'timeout';

		for (let i = 0; i < 15; i++) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			const booking = await bookingApi.getBooking(bookingId);

			if (booking.status === 'CONFIRMED') {
				return 'confirmed';
			}
		}

		return 'timeout';
	};

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();

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

		const confirmation = await waitForConfirmation();

		if (confirmation === 'confirmed') {
			addToast('Payment confirmed! Your booking is complete.', ToastType.SUCCESS);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['event', eventId] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
			]);
			setIsProcessing(false);
			onClose();
			return;
		}

		if (confirmation === 'no_spots_left') {
			setIsProcessing(false);
			addToast('Sorry, someone was faster than you! No spots left.', ToastType.ERROR);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
				queryClient.invalidateQueries({ queryKey: ['event', eventId] }),
				queryClient.invalidateQueries({ queryKey: ['events'] }),
			]);
			onClose();
			return;
		}

		if (confirmation === 'timeout') {
			setIsProcessing(false);
			addToast(
				'Payment is taking longer than expected. Please try again later',
				ToastType.ERROR,
			);
			return;
		}
	};

	const handleClose = async () => {
		if (bookingId && !hasSubmittedPayment) {
			setIsCancelling(true);
			try {
				await cancelBooking(bookingId);
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
		if (!bookingId) return;

		const tryCancel = () => {
			if (!bookingId || hasSubmittedPayment) return;
			// best-effort: fire-and-forget cancellation
			cancelBooking(bookingId).catch(() => {
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
	}, [bookingId, hasSubmittedPayment, cancelBooking]);

	return (
		<form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
			<ModalHeader title="Complete payment" onClose={handleClose} />

			<p className="text-sm text-gray-500 dark:text-gray-400">
				Enter your card details to confirm the booking.
			</p>

			<div className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
				<PaymentElement />
			</div>

			{bookingCache &&
				(() => {
					const refundPercentage = bookingCache.refundPercentage ?? 0;
					const estimatedRefundInCents = bookingCache.estimatedRefundInCents ?? 0;
					const estimatedStripeFeeInCents = bookingCache.estimatedStripeFeeInCents ?? 0;

					if (refundPercentage === 0 || estimatedRefundInCents === 0) {
						return <div className="text-sm text-gray-500">No refund available if cancelled</div>;
					}

					if (estimatedRefundInCents <= 0) {
						return (
							<div className="text-sm text-gray-500">
								Stripe fee will cover the entire amount — no refund
							</div>
						);
					}

					return (
						<div className="text-sm text-gray-500">
							Estimated fee: ${formatCents(estimatedStripeFeeInCents)} — You&apos;ll get back: $
							{formatCents(estimatedRefundInCents)}
						</div>
					);
				})()}

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
	eventId,
	bookingId,
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
			<StripePaymentFormContent
				eventId={eventId}
				bookingId={bookingId}
				onClose={onClose}
			/>
		</Elements>
	);
}
