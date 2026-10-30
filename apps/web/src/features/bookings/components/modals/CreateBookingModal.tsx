'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useModalStore, ModalType, useModalData } from '@/stores/modalStore';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useCreateBooking, useCreateGuestBooking } from '@/features/bookings/hooks/useBookings';
import BookingForm from '@/features/bookings/components/BookingForm/BookingForm';
import type { GuestDetails } from '@/features/bookings/components/BookingForm/types';
import StripePaymentForm from '@/features/bookings/components/StripePaymentForm';
import { BookingWithEstimate, type EventOccurrence } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useCurrentUser } from '@/features/users';
import { useEventById } from '@/features/events';

export default function CreateBookingModal() {
	const { mutate: createBooking, isPending: isMemberLoading } = useCreateBooking();
	const { mutate: createGuestBooking, isPending: isGuestLoading } = useCreateGuestBooking();
	const { closeModal, openModal } = useModalStore();
	const { addToast } = useToastStore();
	const translate = useTranslation();
	const modalData = useModalData(ModalType.CreateBooking);
	const { data: user, isLoading: isUserLoading } = useCurrentUser();
	// Someone with no account can still book: the form asks for a name and an email instead.
	const isGuest = !user && !isUserLoading;
	const isLoading = isMemberLoading || isGuestLoading || isUserLoading;
	const cardEvent = modalData?.event;
	// The card that opened this modal may be minutes old. Spots and dates can move while the
	// person is still filling the form, so the modal keeps its own live copy, seeded with
	// whatever the card already had so there is no blank flash while it catches up.
	const { data: event } = useEventById(cardEvent?.id ?? '', {
		initialData: cardEvent,
		enabled: Boolean(cardEvent),
	});
	const defaultOccurrence = modalData?.selectedOccurrence || null;

	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [booking, setBooking] = useState<BookingWithEstimate | null>(null);
	const [guestAccess, setGuestAccess] = useState<{ token: string; email: string } | null>(null);
	const [pickedOccurrence, setPickedOccurrence] = useState<EventOccurrence | null>(
		defaultOccurrence,
	);
	// The form only ever hands back an id (see onOccurrenceSelect below); this re-reads its
	// spots and price from the live event on every poll, so a choice made a minute ago does not
	// quietly keep showing what was true a minute ago.
	const selectedOccurrence =
		(pickedOccurrence &&
			event?.occurrences?.find((occurrence) => occurrence.id === pickedOccurrence.id)) ||
		pickedOccurrence;

	const handleClose = () => {
		setClientSecret(null);
		setBooking(null);
		setGuestAccess(null);
		setPickedOccurrence(null);
		closeModal();
	};

	if (!event) {
		return null;
	}

	const spotsLeft = selectedOccurrence
		? Math.max(0, selectedOccurrence.maxParticipants - selectedOccurrence.currentParticipants)
		: 0;

	const handleConfirm = (
		quantity: number,
		phone: string,
		promoCode?: string,
		guest?: GuestDetails,
	) => {
		if (!selectedOccurrence) {
			addToast(translate('booking.selectDate'), ToastType.ERROR);
			return;
		}

		const base = { occurrenceId: selectedOccurrence.id, quantity, phone, paymentMethod: 'STRIPE' as const, promoCode };

		if (isGuest && guest) {
			createGuestBooking(
				{ ...base, name: guest.name, email: guest.email },
				{
					onSuccess: (data) => {
						const access = { token: data.accessToken, email: guest.email };

						if (!data.clientSecret) {
							addToast(translate('booking.paymentConfirmed'), ToastType.SUCCESS);
							openModal(ModalType.BookingSuccess, {
								booking: data.booking,
								event,
								occurrence: selectedOccurrence,
								accessToken: access.token,
								guestEmail: access.email,
							});
							return;
						}
						setGuestAccess(access);
						setBooking(data.booking as BookingWithEstimate);
						setClientSecret(data.clientSecret);
					},
				},
			);
			return;
		}

		createBooking(base, {
			onSuccess: (data) => {
				if (!data.clientSecret) {
					addToast(translate('booking.paymentConfirmed'), ToastType.SUCCESS);
					handleClose();
					return;
				}
				setBooking(data.booking as BookingWithEstimate);
				setClientSecret(data.clientSecret);
			},
			onError: () => {
				addToast(translate('booking.createFailed'), ToastType.ERROR);
			},
		});
	};

	return (
		<Modal
			onClose={handleClose}
			ariaLabel={translate('booking.confirmBooking')}
			disableBackdropClose={true}
			disableEscapeClose={true}
		>
			{clientSecret && booking ? (
				<StripePaymentForm
					event={event}
					booking={booking}
					onClose={handleClose}
					clientSecret={clientSecret}
					selectedOccurrence={selectedOccurrence}
					guestAccess={guestAccess ?? undefined}
				/>
			) : (
				<BookingForm
					event={event}
					initialQuantity={modalData?.initialQuantity ?? 1}
					maxQuantity={spotsLeft}
					onSubmit={handleConfirm}
					onOccurrenceSelect={setPickedOccurrence}
					selectedOccurrence={selectedOccurrence}
					isLoading={isLoading}
					submitLabel={
						isLoading ? translate('booking.preparingPayment') : translate('booking.continueToPayment')
					}
					title={translate('booking.confirmBooking')}
					onClose={closeModal}
					userPhone={user?.phone ?? undefined}
					isGuest={isGuest}
				/>
			)}
		</Modal>
	);
}
