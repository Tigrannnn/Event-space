'use client';

import { ConfirmModal, ImagePreviewModal } from '@/components/ui/Modal';
import { AuthModal } from '@/features/auth';
import { ModalType, useModalStore } from '@/stores/modalStore';
import { AnimatePresence } from 'framer-motion';
import { EditProfileModal } from '@/features/profile';
import { CreateBookingModal } from '@/features/bookings/components';
import { UpdateEventModal, CreateEventModal } from '@/features/admin/events';

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
					{/* {activeModal === ModalType.UpdateBooking && <UpdateBookingModal key="update-booking" />} */}
					{activeModal === ModalType.CreateEvent && <CreateEventModal key="create-event" />}
					{activeModal === ModalType.UpdateEvent && <UpdateEventModal key="edit-event" />}
				</>
			)}
		</AnimatePresence>
	);
}
