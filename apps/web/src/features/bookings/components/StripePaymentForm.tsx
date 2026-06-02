'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@/components/ui/Buttons/Button';
import { ModalHeader } from '@/components/ui/Modal';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { Booking, EnvKey } from '@event-space/shared';
import { clientEnv } from '@/config/env';
import useSystemTheme from '@/hooks/systemTheme';

interface StripePaymentFormProps {
	eventId: string;
	onClose: () => void;
	clientSecret: string;
	expectedQuantity?: number;
}

function StripePaymentFormContent({ eventId, onClose, expectedQuantity }: Omit<StripePaymentFormProps, 'clientSecret'>) {
	const stripe = useStripe();
	const elements = useElements();
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const [isProcessing, setIsProcessing] = useState(false);

	const waitForConfirmation = async () => {
		for (let i = 0; i < 10; i++) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			await queryClient.invalidateQueries({ queryKey: ['my-bookings'] });

			const bookings = queryClient.getQueryData<Booking[]>(['my-bookings']);
			const booking = bookings?.find((b) => b.eventId === eventId);

			if (!booking) continue;
			if (expectedQuantity !== undefined) {
				if (booking.quantity === expectedQuantity) break;
			} else if (booking.status === 'CONFIRMED') {
				break;
			}
		}
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
			addToast('Payment failed. Please try again.', ToastType.ERROR);
			return;
		}

		addToast('Payment successful! Your booking will be confirmed shortly.', ToastType.SUCCESS);

		await waitForConfirmation();

		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ['event', eventId] }),
			queryClient.invalidateQueries({ queryKey: ['events'] }),
		]);

		setIsProcessing(false);
		onClose();
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
			<ModalHeader title="Complete payment" onClose={onClose} />

			<p className="text-sm text-gray-500 dark:text-gray-400">
				Enter your card details to confirm the booking. Test card: 4242 4242 4242 4242.
			</p>

			<div className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
				<PaymentElement />
			</div>

			<div className="flex gap-3">
				<Button
					type="button"
					variant="secondary"
					onClick={onClose}
					disabled={isProcessing}
					className="flex-1"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					isLoading={isProcessing}
					disabled={!stripe || !elements || isProcessing}
					className="flex-1"
				>
					{isProcessing ? 'Confirming...' : 'Pay now'}
				</Button>
			</div>
		</form>
	);
}

export default function StripePaymentForm({ eventId, onClose, clientSecret, expectedQuantity }: StripePaymentFormProps) {
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
				<p className="text-sm text-red-500">Stripe is not configured properly. Please contact support.</p>
			</div>
		);
	}

	return (
		<Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: theme === 'dark' ? 'night' : 'stripe' } }}>
			<StripePaymentFormContent eventId={eventId} onClose={onClose} expectedQuantity={expectedQuantity} />
		</Elements>
	);
}
