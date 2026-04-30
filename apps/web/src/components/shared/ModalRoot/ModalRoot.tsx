'use client';

import { ConfirmModal, ImagePreviewModal } from '@/components/ui/Modal';
import { AuthModal } from '@/features/auth';
import { ModalType, useModalStore } from '@/stores/modalStore';
import { AnimatePresence } from 'framer-motion';
import { EditProfileModal } from '@/features/profile';

/**
 * ModalRoot - renders the active modals.
 */
export default function ModalRoot() {
	const { activeModal } = useModalStore();

	return (
		<AnimatePresence mode="wait">
			{activeModal === ModalType.Login && <AuthModal key="login" />}
			{activeModal === ModalType.Register && <AuthModal key="register" />}
			{activeModal === ModalType.VerifyEmail && <AuthModal key="verify" />}
			{activeModal === ModalType.ForgotPassword && <AuthModal key="forgot-password" />}
			{activeModal === ModalType.ImagePreview && <ImagePreviewModal key="image-preview" />}
			{activeModal === ModalType.Confirm && <ConfirmModal key="confirm" />}
			{activeModal === ModalType.EditProfile && <EditProfileModal key="edit-profile" />}
		</AnimatePresence>
	);
}
