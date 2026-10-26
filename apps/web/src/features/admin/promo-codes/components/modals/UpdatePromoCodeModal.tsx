'use client';

import { useUpdatePromoCode } from '@/features/admin/hooks/useAdmin';
import PromoCodeForm from '../PromoCodeForm';
import { useModalStore, useModalData } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { Modal } from '@/components/ui/Modal';
import { useTranslation } from '@/hooks/translation';
import type { CreatePromoCodeData } from '@event-space/shared';

export default function UpdatePromoCodeModal() {
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.UpdatePromoCode);
	const promoCode = modalData?.promoCode;
	const { mutate: updatePromoCode, isPending } = useUpdatePromoCode();
	const translate = useTranslation();

	if (!promoCode) return null;

	return (
		<Modal
			onClose={closeModal}
			size="md"
			ariaLabel={translate('admin.updatePromoCodeModal')}
			disableBackdropClose={isPending}
			disableEscapeClose={isPending}
		>
			<PromoCodeForm
				promoCode={promoCode}
				isPending={isPending}
				submitLabel={isPending ? translate('admin.saving') : translate('admin.updatePromoCode')}
				onCancel={closeModal}
				onSubmit={(data: CreatePromoCodeData) => updatePromoCode({ id: promoCode.id, data })}
			/>
		</Modal>
	);
}
