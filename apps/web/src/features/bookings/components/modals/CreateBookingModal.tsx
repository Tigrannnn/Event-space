'use client';

import { useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Modal } from '@/components/ui/Modal';
import { useModalStore, ModalType, useModalData } from '@/stores/modalStore';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useCreateBooking } from '@/features/bookings/hooks/useBookings';
import BookingForm from '@/features/bookings/components/BookingForm/BookingForm';
import StripePaymentForm from '@/features/bookings/components/StripePaymentForm';
import { clientEnv } from '@/config/env';
import { EnvKey } from '@event-space/shared';
import useSystemTheme from '@/hooks/systemTheme';

export default function CreateBookingModal() {
	const { mutate: createBooking, isPending: isLoading } = useCreateBooking();
	const { closeModal } = useModalStore();
	const { addToast } = useToastStore();
	const modalData = useModalData(ModalType.CreateBooking);
	const event = modalData?.event;

	const theme = useSystemTheme();

	const [clientSecret, setClientSecret] = useState<string | null>(null);

	const stripePromise = useMemo(() => {
		const publishableKey = clientEnv[EnvKey.STRIPE_PUBLISHABLE_KEY];
		if (!publishableKey) {
			addToast('Stripe is not configured properly. Please contact support.', ToastType.ERROR);
			return null;
		}
		return loadStripe(publishableKey);
	}, []);

	if (!event) {
		return null;
	}

	const spotsLeft = event.maxParticipants - event.currentParticipants;
	const maxQuantity = Math.min(4, spotsLeft);

	const handleConfirm = (quantity: number) => {
		createBooking(
			{ eventId: event.id, quantity },
			{
				onSuccess: (data) => {
					if (!data.clientSecret) {
						addToast('Unable to start payment. Please try again.', ToastType.ERROR);
						return;
					}
					setClientSecret(data.clientSecret);
				},
				onError: () => {
					addToast('Failed to create booking. Please try again.', ToastType.ERROR);
				},
			},
		);
	};

	return (
		<Modal onClose={closeModal} ariaLabel="Confirm booking">
			{clientSecret && stripePromise ? (
				<Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: theme === 'dark' ? 'night' : 'stripe' } }}>
					<StripePaymentForm eventId={event.id} onClose={closeModal} />
				</Elements>
			) : (
				<BookingForm
					event={event}
					initialQuantity={1}
					maxQuantity={maxQuantity}
					onSubmit={handleConfirm}
					isLoading={isLoading}
					submitLabel={isLoading ? 'Preparing payment...' : 'Continue to payment'}
					title="Confirm Booking"
					onClose={closeModal}
					availableSpots={spotsLeft}
				/>
			)}
		</Modal>
	);
}
