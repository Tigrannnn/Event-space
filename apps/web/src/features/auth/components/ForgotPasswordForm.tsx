'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import Input from '@/components/ui/Inputs/Input';
import PasswordInput from '@/components/ui/Inputs/PasswordInput';
import Button from '@/components/ui/Buttons/Button';
import { useForgotPassword, useResendCode, useResetPassword } from '../hooks/useAuth';
import {
	AuthAction,
	ForgotPasswordData,
	ForgotPasswordSchema,
	getApiErrorMessage,
	ResetPasswordSchema,
} from '@event-space/shared';
import z from 'zod';
import { useCooldown } from '../hooks/useCooldown';
import { useModalData } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';

const ResetStepSchema = ResetPasswordSchema.omit({ email: true });
type ResetStepData = z.infer<typeof ResetStepSchema>;

export default function ForgotPasswordForm() {
	const modalData = useModalData(ModalType.ForgotPassword);

	const initialEmail = modalData?.email ?? '';
	const [email, setEmail] = useState(initialEmail);
	const [step, setStep] = useState<'email' | 'code'>(modalData?.email ? 'code' : 'email');

	const { mutate: sendCode, isPending: isSending } = useForgotPassword();
	const { mutate: resetPassword, isPending: isResetting } = useResetPassword();
	const { mutate: resendCode, isPending: isResending } = useResendCode();

	const forgotPasswordForm = useForm<ForgotPasswordData>({
		resolver: zodResolver(ForgotPasswordSchema),
		defaultValues: { email },
	});

	const resetPasswordForm = useForm<ResetStepData>({
		resolver: zodResolver(ResetStepSchema),
		defaultValues: { code: '', newPassword: '' },
	});

	const { isOnCooldown, remainingSeconds, startCooldown } = useCooldown({
		email,
		action: AuthAction.RESET_PASSWORD,
	});

	const onEmailSubmit = (data: ForgotPasswordData) => {
		sendCode(data, {
			onSuccess: () => {
				setEmail(data.email);
				setStep('code');
				startCooldown(data.email);
			},
			onError: (error) => {
				const message = getApiErrorMessage(error, 'Failed to send reset code');
				if (message.includes('wait before')) {
					setStep('code');
				}
			},
		});
	};

	const onResetSubmit = (data: ResetStepData) => {
		resetPassword({ email, ...data });
	};

	const onResendCode = (email: string) => {
		resendCode({ email, action: AuthAction.RESET_PASSWORD }, {
			onSuccess: () => {
				startCooldown(email);
			},
		});
	};

	return (
		<div className="space-y-3 sm:space-y-4">
			{step === 'email' ? (
				<form
					onSubmit={forgotPasswordForm.handleSubmit(onEmailSubmit)}
					className="space-y-3 sm:space-y-4"
				>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Enter your email and we&apos;ll send a 6-digit reset code.
					</p>

					<Input
						id="reset-email"
						label="Email"
						type="email"
						error={forgotPasswordForm.formState.errors.email?.message}
						placeholder="Enter your email"
						{...forgotPasswordForm.register('email')}
					/>

					<Button className="w-full" variant="primary" type="submit" isLoading={isSending}>
						Send Code
					</Button>
				</form>
			) : (
				<>
					<form
						onSubmit={resetPasswordForm.handleSubmit(onResetSubmit)}
						className="space-y-3 sm:space-y-4"
					>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Code sent to <strong className="dark:text-gray-300">{email}</strong>
						</p>

						<Input
							id="reset-code"
							label="Reset Code"
							type="text"
							maxLength={6}
							error={resetPasswordForm.formState.errors.code?.message}
							placeholder="123456"
							{...resetPasswordForm.register('code')}
						/>

						<PasswordInput
							id="new-password"
							label="New Password"
							error={resetPasswordForm.formState.errors.newPassword?.message}
							placeholder="Enter new password"
							{...resetPasswordForm.register('newPassword')}
						/>

						<Button className="w-full" variant="primary" type="submit" isLoading={isResetting}>
							Reset Password
						</Button>
					</form>
					<div className="text-center">
						<button
							type="button"
							disabled={isResending || isOnCooldown}
							className="text-primary flex cursor-pointer items-center justify-center gap-1 text-sm font-medium hover:underline disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:underline"
							onClick={() => onResendCode(email)}
						>
							{isResending && <LoaderCircle className="h-4 w-4 animate-spin" />}
							{isOnCooldown
								? `Resend available in ${remainingSeconds} seconds`
								: "Didn't receive the code? Resend"}
						</button>
					</div>
				</>
			)}
		</div>
	);
}
