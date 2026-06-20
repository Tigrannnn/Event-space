'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useModalStore, ModalType, useModalData } from '@/stores/modalStore';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useCreateBooking } from '@/features/bookings/hooks/useBookings';
import BookingForm from '@/features/bookings/components/BookingForm/BookingForm';
import StripePaymentForm from '@/features/bookings/components/StripePaymentForm';
import { BookingWithEstimate } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

export default function CreateBookingModal() {
	const { mutate: createBooking, isPending: isLoading } = useCreateBooking();
	const { closeModal } = useModalStore();
	const { addToast } = useToastStore();
	const translate = useTranslation();
	const modalData = useModalData(ModalType.CreateBooking);
	const event = modalData?.event;

	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [booking, setBooking] = useState<BookingWithEstimate | null>(null);

	const handleClose = () => {
		setClientSecret(null);
		setBooking(null);
		closeModal();
	};

	if (!event) {
		return null;
	}

	const spotsLeft = event.maxParticipants - event.currentParticipants;

	const handleConfirm = (quantity: number) => {
		createBooking(
			{ eventId: event.id, quantity },
			{
				onSuccess: (data) => {
					if (!data.clientSecret) {
						addToast(translate('booking.paymentStartFailed'), ToastType.ERROR);
						return;
					}
					setBooking(data.booking as BookingWithEstimate);
					setClientSecret(data.clientSecret);
				},
				onError: () => {
					addToast(translate('booking.createFailed'), ToastType.ERROR);
				},
			},
		);
	};

	return (
		<Modal onClose={handleClose} ariaLabel={translate('booking.confirmBooking')}>
			{clientSecret && booking ? (
				<StripePaymentForm
					event={event}
					booking={booking}
					onClose={handleClose}
					clientSecret={clientSecret}
				/>
			) : (
				<BookingForm
					event={event}
					initialQuantity={1}
					maxQuantity={spotsLeft}
					onSubmit={handleConfirm}
					isLoading={isLoading}
					submitLabel={isLoading ? translate('booking.preparingPayment') : translate('booking.continueToPayment')}
					title={translate('booking.confirmBooking')}
					onClose={closeModal}
					availableSpots={spotsLeft}
				/>
			)}
		</Modal>
	);
}
