'use client';

import { Modal } from '@/components/ui/Modal';
import { ModalHeader } from '@/components/ui/Modal';
import { useModalStore, ModalType } from '@/stores';
import { useCurrentUser, useUpdateCurrentUser } from '@/features/users';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Buttons/Button';
import Input from '@/components/ui/Inputs/Input';
import { useForgotPassword } from '@/features/auth';
import { useTranslation } from '@/hooks/translation';

const editProfileSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name cannot exceed 50 characters'),
	phone: z.string().optional().nullable(),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

export default function EditProfileModal() {
	const { data: user } = useCurrentUser();
	const translate = useTranslation();
	const { mutate: updateProfile, isPending: isUpdating } = useUpdateCurrentUser();
	const { activeModal, closeModal, openModal } = useModalStore();
	const isOpen = activeModal === ModalType.EditProfile;

	const { mutate: sendCode } = useForgotPassword();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<EditProfileForm>({
		resolver: zodResolver(editProfileSchema),
		defaultValues: {
			name: user?.name || '',
			phone: user?.phone || '',
		},
	});

	const onSubmit = async (data: EditProfileForm) => {
		const updateData = {
			...data,
			phone: data.phone === '' ? null : data.phone,
		};
		updateProfile(updateData, { onSuccess: () => closeModal() });
	};

	const handleChangePassword = () => {
		sendCode({ email: user?.email || '' });
		openModal(ModalType.ForgotPassword, { email: user?.email || '' });
	};

	return (
	<Modal onClose={closeModal} size="md" position="center" ariaLabel={translate('profile.editProfile')}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('profile.editProfile')} onClose={closeModal} />

				<form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
					<Input label={translate('profile.fullName')} {...register('name')} error={errors.name?.message} />
					<Input label={translate('profile.phone')} {...register('phone')} />

					<Button type="button" onClick={handleChangePassword}>
						{translate('profile.changePassword')}
					</Button>

					<div className="flex gap-3 pt-2">
						<Button type="button" variant="secondary" onClick={closeModal} className="flex-1">
							{translate('profile.cancel')}
						</Button>
						<Button type="submit" variant="primary" isLoading={isUpdating} className="flex-1">
							{translate('profile.saveChanges')}
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	);
}
