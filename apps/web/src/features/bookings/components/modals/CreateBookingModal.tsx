'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useModalStore, ModalType, useModalData } from '@/stores/modalStore';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useCreateBooking } from '@/features/bookings/hooks/useBookings';
import BookingForm from '@/features/bookings/components/BookingForm/BookingForm';
import StripePaymentForm from '@/features/bookings/components/StripePaymentForm';

export default function CreateBookingModal() {
	const { mutate: createBooking, isPending: isLoading } = useCreateBooking();
	const { closeModal } = useModalStore();
	const { addToast } = useToastStore();
	const modalData = useModalData(ModalType.CreateBooking);
	const event = modalData?.event;

	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [bookingId, setBookingId] = useState<string | null>(null);

	const handleClose = () => {
		setClientSecret(null);
		setBookingId(null);
		closeModal();
	};

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
					setBookingId(data.booking.id);
					setClientSecret(data.clientSecret);
				},
				onError: () => {
					addToast('Failed to create booking. Please try again.', ToastType.ERROR);
				},
			},
		);
	};

	return (
		<Modal onClose={handleClose} ariaLabel="Confirm booking">
			{clientSecret ? (
				<StripePaymentForm
					eventId={event.id}
					bookingId={bookingId}
					onClose={handleClose}
					clientSecret={clientSecret}
				/>
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
