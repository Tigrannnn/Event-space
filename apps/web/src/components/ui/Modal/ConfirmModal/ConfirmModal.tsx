'use client';

import { useModalStore, useModalData } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';
import Modal from '../Modal';
import Button from '../../Buttons/Button';
import { useTranslation } from '@/hooks/translation';


export default function ConfirmModal() {
	const { closeModal } = useModalStore();
	const data = useModalData(ModalType.Confirm);
	const translate = useTranslation();

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
			<div className="max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 in-data-[skin=market]:shadow-none in-data-[skin=drawer]:shadow-none in-data-[skin=market]:dark:bg-neutral-900 in-data-[skin=drawer]:dark:bg-neutral-900">
				<h3 className="text-primary in-data-[skin=market]:text-gray-900 in-data-[skin=drawer]:text-gray-900 in-data-[skin=market]:dark:text-white in-data-[skin=drawer]:dark:text-white mb-2 text-xl font-black in-data-[skin=market]:font-bold in-data-[skin=drawer]:font-bold">{data.title}</h3>
				<div className="mb-6 leading-relaxed text-gray-600 dark:text-gray-300">{data.message}</div>

				<div className="flex gap-3">
					<Button variant="secondary" onClick={handleCancel} className="flex-1">
						{data.cancelText || translate('profile.cancel')}
					</Button>
					<Button
						variant={data.variant || 'primary'}
						type="button"
						onClick={handleConfirm}
						className="flex-1"
					>
						{data.confirmText || translate('auth.continue')}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
