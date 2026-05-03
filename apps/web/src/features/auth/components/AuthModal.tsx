'use client';

import { Modal } from '@/components/ui/Modal';
import { GoogleButton } from '@/components/ui/Buttons';
import { ModalDivider, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { ModalType, useModalStore } from '@/stores';
import VerifyEmailForm from './VerifyEmailForm';
import { authModalConfig } from './authModalConfig';
import ForgotPasswordForm from './ForgotPasswordForm';

/**
 * AuthModal wraps LoginForm or RegisterForm with the universal Modal component.
 * Handles header, close button, Google login, and footer switching.
 */
export default function AuthModal() {
	const { activeModal, openModal, closeModal } = useModalStore();

	const authTypes = [
		ModalType.Login,
		ModalType.Register,
		ModalType.VerifyEmail,
		ModalType.ForgotPassword,
	];
	const config = authModalConfig[activeModal as ModalType];

	return (
		<Modal
			onClose={closeModal}
			size="lg"
			position="center"
			disableEscapeClose={false}
			disableBackdropClose={false}
			ariaLabel={config?.ariaLabel || 'Auth modal'}
		>
			{config && (
				<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6 md:p-8 lg:p-10 dark:bg-gray-900 dark:shadow-black/50">
					{/* Header */}
					<ModalHeader title={config.title} subtitle={config?.subtitle} onClose={closeModal} />

					{/* Form */}
					{activeModal === ModalType.Login && <LoginForm />}
					{activeModal === ModalType.Register && <RegisterForm />}
					{activeModal === ModalType.VerifyEmail && <VerifyEmailForm />}
					{activeModal === ModalType.ForgotPassword && <ForgotPasswordForm />}

					{config.showGoogle && (
						<>
							<ModalDivider />
							<GoogleButton />
						</>
					)}

					{config.footerQuestion && (
						<ModalFooter
							question={config.footerQuestion}
							actionLabel={config.footerAction}
							onActionClick={() => {
								if (activeModal === ModalType.Login) openModal(ModalType.Register);
								else if (activeModal === ModalType.Register) openModal(ModalType.Login);
								else if (activeModal === ModalType.ForgotPassword) openModal(ModalType.Login);
							}}
						/>
					)}
				</div>
			)}
		</Modal>
	);
}
