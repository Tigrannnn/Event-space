'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PasswordInput from '@/components/ui/Inputs/PasswordInput';
import Input from '@/components/ui/Inputs/Input';
import Button from '@/components/ui/Buttons/Button';
import { AuthAction, RegisterData, RegisterSchema } from '@event-space/shared';
import { useRegister } from '../hooks/useAuth';
import { useCooldown } from '../hooks/useCooldown';

export default function RegisterForm() {
	const { mutate: registerUser, isPending: isRegistering } = useRegister();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterData>({
		resolver: zodResolver(RegisterSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
		},
	});

	const onFormSubmit = (data: RegisterData) => {
		registerUser(data);
	};

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3 sm:space-y-4">
			<Input
				id="name"
				label="Name"
				type="text"
				error={errors.name?.message}
				placeholder="Enter your name"
				{...register('name')}
			/>

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
				placeholder="Create a password"
				{...register('password')}
			/>

			<Button className="w-full" variant="primary" type="submit" isLoading={isRegistering}>
				Continue
			</Button>
		</form>
	);
}
