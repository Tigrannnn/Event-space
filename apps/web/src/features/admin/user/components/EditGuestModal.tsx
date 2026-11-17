'use client';

import { Modal, ModalHeader } from '@/components/ui/Modal';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { useUpdateShadowUser } from '@/features/admin/hooks/useAdmin';
import GuestForm from './GuestForm';

export default function EditGuestModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.EditGuest);
	const { mutate: updateGuest, isPending } = useUpdateShadowUser();

	const user = modalData?.user;

	if (!user) {
		return null;
	}

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

				<GuestForm
					user={user}
					isPending={isPending}
					onSubmit={(data) => updateGuest({ id: user.id, data })}
					onCancel={closeModal}
				/>
			</div>
		</Modal>
	);
}
