'use client';

import { useCreateCategory } from '@/features/admin/hooks/useAdmin';
import CategoryForm from '../CategoryForm';
import { mapFormValuesToCreateCategoryData } from '../CategoryForm/form-mappers';
import type { CategoryFormValues } from '../CategoryForm/category-form.schema';
import { useModalStore } from '@/stores';
import { Modal } from '@/components/ui/Modal';
import { useTranslation } from '@/hooks/translation';

export default function CreateCategoryModal() {
	const { closeModal } = useModalStore();
	const { mutateAsync: createCategory, isPending } = useCreateCategory();
	const translate = useTranslation();

	return (
		<Modal
			onClose={closeModal}
			size="full"
			position="center"
			ariaLabel={translate('admin.createCategoryModal')}
			disableBackdropClose={isPending}
			disableEscapeClose={isPending}
		>
			<CategoryForm
				isPending={isPending}
				submitLabel={isPending ? translate('admin.creating') : translate('admin.createCategory')}
				onCancel={closeModal}
				category={undefined}
				onSubmit={(values: CategoryFormValues) => createCategory(mapFormValuesToCreateCategoryData(values))}
			/>
		</Modal>
	);
}
