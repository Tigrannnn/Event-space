'use client';

import { Modal } from '@/components/ui/Modal';
import { useModalStore, ModalType, useModalData } from '@/stores/modalStore';
import { useUpdateBooking } from '@/features/bookings/hooks/useBookings';
import BookingForm from '@/features/bookings/components/BookingForm/BookingForm';

export default function UpdateBookingModal() {
	const { mutate: updateBooking, isPending: isLoading } = useUpdateBooking();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.UpdateBooking);
	const booking = modalData?.booking;

	if (!booking || !booking.event) return null;

	const event = booking.event;
	const spotsLeftForUser = event.maxParticipants - event.currentParticipants + booking.quantity;
	const maxQuantity = Math.min(4, spotsLeftForUser);

	const handleSave = (quantity: number) => {
		updateBooking({ id: booking.id, data: { quantity } });
	};

	return (
		<Modal onClose={closeModal} ariaLabel="Update booking">
			<BookingForm
				event={event}
				initialQuantity={booking.quantity}
				maxQuantity={maxQuantity}
				onSubmit={handleSave}
				isLoading={isLoading}
				submitLabel={isLoading ? 'Saving...' : 'Save Changes'}
				title="Update Booking"
				onClose={closeModal}
				availableSpots={spotsLeftForUser}
			/>
		</Modal>
	);
}
