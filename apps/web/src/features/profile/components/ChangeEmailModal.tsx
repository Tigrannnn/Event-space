'use client';

import { useState } from 'react';
import { EmailSchema } from '@event-space/shared';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Input from '@/components/ui/Inputs/Input';
import Button from '@/components/ui/Buttons/Button';
import { useModalStore } from '@/stores';
import { useCurrentUser } from '@/features/users';
import { useConfirmEmailChange, useRequestEmailChange } from '@/features/auth';
import { useTranslation } from '@/hooks/translation';

export default function ChangeEmailModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const { data: user } = useCurrentUser();

	const requestChange = useRequestEmailChange();
	const confirmChange = useConfirmEmailChange();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [code, setCode] = useState('');
	const [emailError, setEmailError] = useState('');
	const [sentTo, setSentTo] = useState<string | null>(null);

	const hasPassword = user?.hasPassword !== false;

	const handleRequest = (formEvent: React.FormEvent) => {
		formEvent.preventDefault();

		const trimmed = email.trim().toLowerCase();

		if (!EmailSchema.safeParse(trimmed).success) {
			setEmailError(translate('profile.invalidEmail'));
			return;
		}

		if (trimmed === user?.email) {
			setEmailError(translate('profile.emailSameAsCurrent'));
			return;
		}

		setEmailError('');

		requestChange.mutate(
			{ email: trimmed, ...(password ? { password } : {}) },
			{ onSuccess: () => setSentTo(trimmed) },
		);
	};

	const handleConfirm = (formEvent: React.FormEvent) => {
		formEvent.preventDefault();
		if (!sentTo) return;

		confirmChange.mutate({ email: sentTo, code: code.trim() });
	};

	return (
		<Modal
			onClose={closeModal}
			size="md"
			position="center"
			ariaLabel={translate('profile.changeEmail')}
			disableBackdropClose={requestChange.isPending || confirmChange.isPending}
		>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50 in-data-[skin=market]:shadow-none in-data-[skin=market]:dark:bg-neutral-900">
				<ModalHeader title={translate('profile.changeEmail')} onClose={closeModal} />

				{sentTo ? (
					<form onSubmit={handleConfirm} className="mt-4 space-y-4">
						<p className="text-sm text-gray-600 dark:text-gray-300">
							{translate('profile.emailCodeSentTo', { email: sentTo })}
						</p>

						<Input
							label={translate('profile.confirmationCode')}
							inputMode="numeric"
							autoComplete="one-time-code"
							value={code}
							onChange={(changeEvent) => setCode(changeEvent.target.value)}
							disabled={confirmChange.isPending}
							required
						/>

						<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
							<Button
								type="button"
								variant="secondary"
								onClick={() => setSentTo(null)}
								disabled={confirmChange.isPending}
								className="flex-1"
							>
								{translate('profile.back')}
							</Button>
							<Button
								type="submit"
								variant="primary"
								isLoading={confirmChange.isPending}
								className="flex-1"
							>
								{translate('profile.confirmEmail')}
							</Button>
						</div>
					</form>
				) : (
					<form onSubmit={handleRequest} className="mt-4 space-y-4">
						<p className="text-sm text-gray-600 dark:text-gray-300">
							{translate('profile.changeEmailHint')}
						</p>

						<Input
							label={translate('profile.newEmail')}
							type="email"
							value={email}
							onChange={(changeEvent) => setEmail(changeEvent.target.value)}
							error={emailError}
							disabled={requestChange.isPending}
							required
						/>

						{hasPassword && (
							<Input
								label={translate('profile.currentPassword')}
								type="password"
								autoComplete="current-password"
								value={password}
								onChange={(changeEvent) => setPassword(changeEvent.target.value)}
								disabled={requestChange.isPending}
							/>
						)}

						<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
							<Button
								type="button"
								variant="secondary"
								onClick={closeModal}
								disabled={requestChange.isPending}
								className="flex-1"
							>
								{translate('profile.cancel')}
							</Button>
							<Button
								type="submit"
								variant="primary"
								isLoading={requestChange.isPending}
								className="flex-1"
							>
								{translate('profile.sendCode')}
							</Button>
						</div>
					</form>
				)}
			</div>
		</Modal>
	);
}
