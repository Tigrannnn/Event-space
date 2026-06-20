'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PasswordInput from '@/components/ui/Inputs/PasswordInput';
import Input from '@/components/ui/Inputs/Input';
import Button from '@/components/ui/Buttons/Button';
import { RegisterData, RegisterSchema } from '@event-space/shared';
import { useRegister } from '../hooks/useAuth';
import { useTranslation } from '@/hooks/translation';

export default function RegisterForm() {
	const { mutate: registerUser, isPending: isRegistering } = useRegister();
	const translate = useTranslation();

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
				label={translate('auth.name')}
				type="text"
				error={errors.name?.message}
				placeholder={translate('auth.enterName')}
				{...register('name')}
			/>

			<Input
				id="email"
				label={translate('auth.email')}
				type="email"
				error={errors.email?.message}
				placeholder={translate('auth.enterEmail')}
				{...register('email')}
			/>

			<PasswordInput
				id="password"
				label={translate('auth.password')}
				error={errors.password?.message}
				placeholder={translate('auth.createPassword')}
				{...register('password')}
			/>

			<Button className="w-full" variant="primary" type="submit" isLoading={isRegistering}>
				{translate('auth.continue')}
			</Button>
		</form>
	);
}
