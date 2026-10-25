'use client';

import { useState } from 'react';
import { UpdateShadowUserSchema, type UpdateShadowUserData } from '@event-space/shared';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Input from '@/components/ui/Inputs/Input';
import Button from '@/components/ui/Buttons/Button';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { useUpdateShadowUser } from '@/features/admin/hooks/useAdmin';

type FieldName = 'name' | 'phone' | 'email';

export default function EditGuestModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.EditGuest);
	const { mutate: updateGuest, isPending } = useUpdateShadowUser();

	const user = modalData?.user;

	const [name, setName] = useState(user?.name ?? '');
	const [phone, setPhone] = useState(user?.phone ?? '');
	const [email, setEmail] = useState(user?.email ?? '');
	const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

	if (!user) {
		return null;
	}

	const handleSubmit = (formEvent: React.FormEvent) => {
		formEvent.preventDefault();

		const payload: UpdateShadowUserData = {
			name: name.trim(),
			phone: phone.trim() || null,
			email: email.trim() || null,
		};

		const parsed = UpdateShadowUserSchema.safeParse(payload);

		if (!parsed.success) {
			const found: Partial<Record<FieldName, string>> = {};
			for (const issue of parsed.error.issues) {
				const field = issue.path[0] as FieldName | undefined;
				if (field && !found[field]) found[field] = issue.message;
			}
			setErrors(found);
			return;
		}

		setErrors({});
		updateGuest({ id: user.id, data: parsed.data });
	};

	return (
		<Modal
			onClose={closeModal}
			size="md"
			ariaLabel={translate('admin.editGuest')}
			disableBackdropClose={isPending}
			disableEscapeClose={isPending}
		>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.editGuest')} onClose={closeModal} />

				<p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
					{translate('admin.editGuestHint')}
				</p>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<Input
						label={translate('admin.guestName')}
						value={name}
						onChange={(changeEvent) => setName(changeEvent.target.value)}
						error={errors.name}
						disabled={isPending}
						required
					/>

					<Input
						label={translate('admin.phone')}
						type="tel"
						value={phone}
						onChange={(changeEvent) => setPhone(changeEvent.target.value)}
						error={errors.phone}
						disabled={isPending}
					/>

					<Input
						label={translate('admin.guestEmail')}
						type="email"
						value={email}
						onChange={(changeEvent) => setEmail(changeEvent.target.value)}
						error={errors.email}
						disabled={isPending}
					/>

					<p className="text-xs text-gray-500 dark:text-gray-400">
						{translate('admin.editGuestEmailHint')}
					</p>

					<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
						<Button type="button" variant="secondary" onClick={closeModal} disabled={isPending}>
							{translate('admin.cancel')}
						</Button>
						<Button type="submit" isLoading={isPending}>
							{translate('admin.saveChanges')}
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	);
}
