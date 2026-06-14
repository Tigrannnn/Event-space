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

const editProfileSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name cannot exceed 50 characters'),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

export default function EditProfileModal() {
	const { data: user } = useCurrentUser();
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
		},
	});

	const onSubmit = async (data: EditProfileForm) => {
		updateProfile(data, { onSuccess: () => closeModal() });
	};

	const handleChangePassword = () => {
		sendCode({ email: user?.email || '' });
		openModal(ModalType.ForgotPassword, { email: user?.email || '' });
	};

	return (
		<Modal onClose={closeModal} size="md" position="center" ariaLabel="Edit Profile">
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title="Edit Profile" onClose={closeModal} />

				<form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
					<Input label="Full Name" {...register('name')} error={errors.name?.message} />

					<Button type="button" onClick={handleChangePassword}>
						Change password
					</Button>

					<div className="flex gap-3 pt-2">
						<Button type="button" variant="secondary" onClick={closeModal} className="flex-1">
							Cancel
						</Button>
						<Button type="submit" variant="primary" isLoading={isUpdating} className="flex-1">
							Save Changes
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	);
}
