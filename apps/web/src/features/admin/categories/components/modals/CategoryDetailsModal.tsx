'use client';

import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores/modalStore/types';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import { Copy } from 'lucide-react';
import { useToastStore, ToastType } from '@/stores/toastStore';
import { useTranslation } from '@/hooks/translation';
import { getCategoryTranslation } from '@event-space/shared';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';

export default function CategoryDetailsModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const { addToast } = useToastStore();
	const modalData = useModalData(ModalType.CategoryDetails);
	const category = modalData?.category;

	if (!category) {
		return null;
	}

	const categoryTranslation = getCategoryTranslation(category, translate.locale);

	const handleCopyId = () => {
		navigator.clipboard.writeText(category.id);
		addToast(translate('admin.categoryIdCopied'), ToastType.SUCCESS);
	};

	return (
		<Modal onClose={closeModal} size="xl" ariaLabel={translate('admin.categoryDetails')}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.categoryDetails')} onClose={closeModal} />

				<div className="grid gap-6">
					<section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950">
						<p className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
							{translate('admin.eventInformation')}
						</p>
						<div className="mt-4 grid gap-4 text-sm text-gray-700 dark:text-gray-200">
							<div>
								<button
									type="button"
									className="text-primary cursor-pointer text-left text-lg font-semibold transition hover:underline"
								>
									{categoryTranslation.name}
								</button>
							</div>

							<div className="flex items-center gap-2 rounded-2xl bg-gray-100 p-3 dark:bg-gray-800">
								<code className="flex-1 font-mono text-xs break-all text-gray-700 dark:text-gray-300">
									{category.id}
								</code>
								<button
									type="button"
									onClick={handleCopyId}
									className="shrink-0 cursor-pointer rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
									title="Copy ID"
								>
									<Copy className="h-3 w-3" />
								</button>
							</div>

							<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
								<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
									{translate('admin.slug')}
								</p>
								<p className="mt-1 font-medium text-gray-900 dark:text-white">
									{category.slug}
								</p>
							</div>

							<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
								<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
									{translate('admin.createdAt')}
								</p>
								<p className="mt-1 font-medium text-gray-900 dark:text-white">
									{new Date(category.createdAt).toLocaleString()}
								</p>
							</div>

							<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
								<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
									{translate('admin.updatedAt')}
								</p>
								<p className="mt-1 font-medium text-gray-900 dark:text-white">
									{new Date(category.updatedAt).toLocaleString()}
								</p>
							</div>

							<div className="space-y-2">
								<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
									{translate('admin.translations')}
								</p>
								<div className="grid gap-2">
									{category.translations.map((translation) => (
										<div
											key={translation.id}
											className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
										>
											<p className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
												{translation.locale}
											</p>
											<p className="mt-1 font-medium text-gray-900 dark:text-white">
												{translation.name}
											</p>
										</div>
									))}
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
		</Modal>
	);
}
