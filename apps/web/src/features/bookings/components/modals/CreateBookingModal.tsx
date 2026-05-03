'use client';

import { Modal } from '@/components/ui/Modal';
import { useModalStore, ModalType, useModalData } from '@/stores/modalStore';
import { useCreateBooking } from '@/features/bookings/hooks/useBookings';
import { BookingForm } from '@/features/bookings/components';

export default function CreateBookingModal() {
	const { mutate: createBooking, isPending: isLoading } = useCreateBooking();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.CreateBooking);
	const event = modalData?.event;

	if (!event) return null;

	const spotsLeft = event.maxParticipants - event.currentParticipants;
	const maxQuantity = Math.min(4, spotsLeft);

	const handleConfirm = (quantity: number) => {
		createBooking({
			eventId: event.id,
			quantity,
		});
	};

	return (
		<Modal onClose={closeModal} ariaLabel="Confirm booking">
			<BookingForm
				event={event}
				initialQuantity={1}
				maxQuantity={maxQuantity}
				onSubmit={handleConfirm}
				isLoading={isLoading}
				submitLabel={isLoading ? 'Booking...' : 'Confirm Booking'}
				title="Confirm Booking"
				onClose={closeModal}
				availableSpots={spotsLeft}
			/>
		</Modal>
	);
}
