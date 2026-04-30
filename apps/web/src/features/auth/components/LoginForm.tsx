'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PasswordInput from '@/components/ui/Inputs/PasswordInput';
import Input from '@/components/ui/Inputs/Input';
import Button from '@/components/ui/Buttons/Button';
import { LoginData, LoginSchema } from '@event-space/shared';
import { useLogin } from '../hooks/useAuth';
import { ModalType, useModalStore } from '@/stores';

export default function LoginForm() {
	const { mutate: loginUser, isPending: isLoggingIn } = useLogin();
	const { openModal } = useModalStore();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginData>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onFormSubmit = (data: LoginData) => {
		loginUser(data);
	};

	const onForgotPassword = () => {
		openModal(ModalType.ForgotPassword, null);
	};

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3 sm:space-y-4">
			<Input
				id="email"
				label="Email"
				type="email"
				error={errors.email?.message}
				placeholder="Enter your email"
				{...register('email')}
			/>

			<PasswordInput
				id="password"
				label="Password"
				error={errors.password?.message}
				placeholder="Enter your password"
				{...register('password')}
			/>

			<div className="text-right">
				<button
					type="button"
					onClick={onForgotPassword}
					className="text-primary cursor-pointer text-[15px] font-semibold transition-all hover:underline sm:text-sm"
				>
					Forgot password?
				</button>
			</div>

			<Button className="w-full" variant="primary" type="submit" isLoading={isLoggingIn}>
				Continue
			</Button>
		</form>
	);
}
