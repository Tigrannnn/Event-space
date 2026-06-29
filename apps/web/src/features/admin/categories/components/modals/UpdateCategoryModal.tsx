'use client';

import { useUpdateCategory } from '@/features/admin/hooks/useAdmin';
import CategoryForm from '../CategoryForm';
import { mapFormValuesToUpdateCategoryData } from '../CategoryForm/form-mappers';
import type { CategoryFormValues } from '../CategoryForm/category-form.schema';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores/modalStore/types';
import { Modal } from '@/components/ui/Modal';
import { useTranslation } from '@/hooks/translation';

export default function UpdateCategoryModal() {
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.UpdateCategory);
	const { mutateAsync: updateCategory, isPending } = useUpdateCategory();
	const translate = useTranslation();

	if (!modalData?.category) {
		return null;
	}

	return (
		<Modal
			onClose={closeModal}
			size="full"
			position="center"
			ariaLabel={translate('admin.updateCategoryModal')}
			disableBackdropClose={isPending}
			disableEscapeClose={isPending}
		>
			<CategoryForm
				isPending={isPending}
				submitLabel={isPending ? translate('admin.saving') : translate('admin.updateCategory')}
				onCancel={closeModal}
				category={modalData.category}
				onSubmit={(values: CategoryFormValues) => 
					updateCategory({ id: modalData.category.id, data: mapFormValuesToUpdateCategoryData(values) })
				}
			/>
		</Modal>
	);
}
