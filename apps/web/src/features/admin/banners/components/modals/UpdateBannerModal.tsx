'use client';

import { Modal } from '@/components/ui/Modal';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores/modalStore/types';
import { useTranslation } from '@/hooks/translation';
import { useUpdateBanner } from '@/features/admin/hooks/useAdmin';
import BannerForm from '../BannerForm';
import { buildUpdateBannerFormData } from '../BannerForm/form-mappers';
import type { BannerFormValues } from '../BannerForm/banner-form.schema';

export default function UpdateBannerModal() {
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.UpdateBanner);
	const { mutateAsync: updateBanner, isPending } = useUpdateBanner();
	const translate = useTranslation();

	if (!modalData?.banner) {
		return null;
	}

	const banner = modalData.banner;

	return (
		<Modal
			onClose={closeModal}
			size="full"
			position="center"
			ariaLabel={translate('admin.updateBanner')}
			disableBackdropClose={isPending}
			disableEscapeClose={isPending}
		>
			<BannerForm
				isPending={isPending}
				banner={banner}
				submitLabel={isPending ? translate('admin.saving') : translate('admin.updateBanner')}
				onCancel={closeModal}
				onSubmit={(values: BannerFormValues) =>
					updateBanner({ id: banner.id, formData: buildUpdateBannerFormData(values, banner) })
				}
			/>
		</Modal>
	);
}
