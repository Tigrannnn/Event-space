'use client';

import { Modal } from '@/components/ui/Modal';
import { useModalStore } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { useCreateBanner } from '@/features/admin/hooks/useAdmin';
import BannerForm from '../BannerForm';
import { buildCreateBannerFormData } from '../BannerForm/form-mappers';
import type { BannerFormValues } from '../BannerForm/banner-form.schema';

export default function CreateBannerModal() {
	const { closeModal } = useModalStore();
	const { mutateAsync: createBanner, isPending } = useCreateBanner();
	const translate = useTranslation();

	return (
		<Modal
			onClose={closeModal}
			size="full"
			position="center"
			ariaLabel={translate('admin.createBanner')}
			disableBackdropClose={isPending}
			disableEscapeClose={isPending}
		>
			<BannerForm
				isPending={isPending}
				submitLabel={isPending ? translate('admin.creating') : translate('admin.createBanner')}
				onCancel={closeModal}
				onSubmit={(values: BannerFormValues) => createBanner(buildCreateBannerFormData(values))}
			/>
		</Modal>
	);
}
