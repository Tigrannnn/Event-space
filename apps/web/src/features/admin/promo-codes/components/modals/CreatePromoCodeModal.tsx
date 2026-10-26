'use client';

import { useCreatePromoCode } from '@/features/admin/hooks/useAdmin';
import PromoCodeForm from '../PromoCodeForm';
import { useModalStore } from '@/stores';
import { Modal } from '@/components/ui/Modal';
import { useTranslation } from '@/hooks/translation';
import type { CreatePromoCodeData } from '@event-space/shared';

export default function CreatePromoCodeModal() {
	const { closeModal } = useModalStore();
	const { mutate: createPromoCode, isPending } = useCreatePromoCode();
	const translate = useTranslation();

	return (
		<Modal
			onClose={closeModal}
			size="md"
			ariaLabel={translate('admin.createPromoCodeModal')}
			disableBackdropClose={isPending}
			disableEscapeClose={isPending}
		>
			<PromoCodeForm
				isPending={isPending}
				submitLabel={isPending ? translate('admin.creating') : translate('admin.createPromoCode')}
				onCancel={closeModal}
				onSubmit={(data: CreatePromoCodeData) => createPromoCode(data)}
			/>
		</Modal>
	);
}
