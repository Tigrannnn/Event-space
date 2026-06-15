'use client';

import { useModalStore, useModalData } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';
import Modal from '../Modal';
import Button from '../../Buttons/Button';

export default function ConfirmModal() {
	const { closeModal } = useModalStore();
	const data = useModalData(ModalType.Confirm);

	const handleConfirm = () => {
		data?.onConfirm();
		closeModal();
	};

	const handleCancel = () => {
		data?.onCancel?.();
		closeModal();
	};

	if (!data) return null;

	return (
		<Modal ariaLabel={data.title} onClose={handleCancel} size={data.size ?? 'sm'} position="center">
			<div className="max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
				<h3 className="text-primary mb-2 text-xl font-black">{data.title}</h3>
				<div className="mb-6 leading-relaxed text-gray-600 dark:text-gray-300">{data.message}</div>

				<div className="flex gap-3">
					<Button variant="secondary" onClick={handleCancel} className="flex-1">
						{data.cancelText || 'Cancel'}
					</Button>
					<Button
						variant={data.variant || 'primary'}
						type="button"
						onClick={handleConfirm}
						className="flex-1"
					>
						{data.confirmText || 'Confirm'}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
