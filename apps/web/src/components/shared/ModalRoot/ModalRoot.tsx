'use client';

import { ConfirmModal, ImagePreviewModal, ContactModal } from '@/components/ui/Modal';
import { AuthModal } from '@/features/auth';
import { ModalType, useModalStore } from '@/stores/modalStore';
import { AnimatePresence } from 'framer-motion';
import { EditProfileModal } from '@/features/profile';
import { CreateBookingModal } from '@/features/bookings/components';
import {
	UpdateEventModal,
	CreateEventModal,
} from '@/features/admin/events';
import {
	CreateCategoryModal,
	UpdateCategoryModal,
	CategoryDetailsModal,
} from '@/features/admin/categories';
import UserDetailsModal from '@/features/admin/user/components/UserDetailsModal';
import EventDetailsModal from '@/features/admin/events/components/modals/EventDetailsModal';
import BookingDetailsModal from '@/features/admin/bookings/components/BookingDetailsModal';
import CreateManualBookingModal from '@/features/admin/bookings/components/CreateManualBookingModal';
import BookingCancelModal from '@/features/admin/bookings/components/BookingCancelModal';

/**
 * ModalRoot - renders the active modals.
 */
export default function ModalRoot() {
	const { activeModal, isExiting, clearModalData } = useModalStore();

	return (
		<AnimatePresence mode="wait" onExitComplete={clearModalData}>
			{!isExiting && (
				<>
					{activeModal === ModalType.Login && <AuthModal key="login" />}
					{activeModal === ModalType.Register && <AuthModal key="register" />}
					{activeModal === ModalType.VerifyEmail && <AuthModal key="verify" />}
					{activeModal === ModalType.ForgotPassword && <AuthModal key="forgot-password" />}
					{activeModal === ModalType.ImagePreview && <ImagePreviewModal key="image-preview" />}
					{activeModal === ModalType.Confirm && <ConfirmModal key="confirm" />}
					{activeModal === ModalType.EditProfile && <EditProfileModal key="edit-profile" />}
					{activeModal === ModalType.CreateBooking && <CreateBookingModal key="create-booking" />}
					{activeModal === ModalType.CreateManualBooking && (
						<CreateManualBookingModal key="create-manual-booking" />
					)}
					{activeModal === ModalType.BookingDetails && <BookingDetailsModal key="booking-details" />}
					{activeModal === ModalType.BookingCancel && <BookingCancelModal key="booking-cancel" />}
					{activeModal === ModalType.UserDetails && <UserDetailsModal key="user-details" />}
					{activeModal === ModalType.EventDetails && <EventDetailsModal key="event-details" />}
					{/* {activeModal === ModalType.UpdateBooking && <UpdateBookingModal key="update-booking" />} */}
					{activeModal === ModalType.CreateEvent && <CreateEventModal key="create-event" />}
					{activeModal === ModalType.UpdateEvent && <UpdateEventModal key="edit-event" />}
					{activeModal === ModalType.ContactInfo && <ContactModal key="contact-info" />}
					{activeModal === ModalType.CreateCategory && <CreateCategoryModal key="create-category" />}
					{activeModal === ModalType.UpdateCategory && <UpdateCategoryModal key="update-category" />}
					{activeModal === ModalType.CategoryDetails && <CategoryDetailsModal key="category-details" />}
				</>
			)}
		</AnimatePresence>
	);
}
