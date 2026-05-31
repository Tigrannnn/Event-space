'use client';

import { FormEvent, useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@/components/ui/Buttons/Button';
import { ModalHeader } from '@/components/ui/Modal';
import { ToastType, useToastStore } from '@/stores/toastStore';

interface Booking {
	eventId: string;
	status: string;
}

interface StripePaymentFormProps {
	eventId: string;
	onClose: () => void;
}

export default function StripePaymentForm({ eventId, onClose }: StripePaymentFormProps) {
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

			if (booking?.status === 'CONFIRMED') break;
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