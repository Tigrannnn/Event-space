'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { VerifyEmailSchema, VerifyEmailData, AuthAction } from '@event-space/shared';
import Input from '@/components/ui/Inputs/Input';
import Button from '@/components/ui/Buttons/Button';
import { useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores/modalStore/types';
import { useResendCode, useVerifyEmail } from '../hooks/useAuth';
import { useCooldown } from '../hooks/useCooldown';
import { useModalData } from '@/stores/modalStore/modalStore';

export default function VerifyEmailForm() {
	const { openModal } = useModalStore();
	const modalData = useModalData(ModalType.VerifyEmail);
	const { mutate: verifyEmail, isPending: isVerifyingEmail } = useVerifyEmail();
	const { mutate: resendCode, isPending: isResending } = useResendCode();

	const email = modalData?.email ?? '';

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<VerifyEmailData>({
		resolver: zodResolver(VerifyEmailSchema),
		defaultValues: {
			email: email,
			code: '',
		},
	});

	const { isOnCooldown, remainingSeconds, startCooldown } = useCooldown({
		email,
		action: AuthAction.REGISTER,
	});

	const onFormSubmit = async (data: VerifyEmailData) => {
		verifyEmail(data);
	};

	const onResendCode = (email: string) => {
		resendCode({ email, action: AuthAction.REGISTER });
		startCooldown();
	};

	return (
		<div className="space-y-6">
			<div className="text-center">
				<p className="text-sm text-gray-500 dark:text-gray-400">
					We sent a verification code to <br />
					<span className="font-semibold text-gray-900 dark:text-gray-200">{email}</span>{' '}
					<span
						onClick={() => {
							openModal(ModalType.Register);
						}}
						className="text-primary cursor-pointer hover:underline"
					>
						Change
					</span>
				</p>
			</div>

			<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
				<Input
					id="code"
					label="Verification Code"
					placeholder="Enter 6-digit code"
					error={errors.code?.message}
					{...register('code')}
				/>

				<Button className="w-full" variant="primary" type="submit" isLoading={isVerifyingEmail}>
					Verify Account
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
		</div>
	);
}
