'use client';

import { Modal, ModalHeader } from '@/components/ui/Modal';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { Copy } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/clipboard';
import { useTranslation } from '@/hooks/translation';
import { localeIntl } from '@/lib/i18n/config';
import { formatDateTime } from '@/utils/date';

export default function UserDetailsModal() {
	const translate = useTranslation();
	const locale = translate.locale;
	const { closeModal } = useModalStore();
	const copyToClipboard = useCopyToClipboard();
	const modalData = useModalData(ModalType.UserDetails);
	const user = modalData?.user;

	if (!user) {
		return null;
	}

	const handleCopyId = () => {
		void copyToClipboard(user.id, 'admin.copyId');
	};

	return (
		<Modal onClose={closeModal} size="lg" ariaLabel={translate('admin.userDetails')}>
			<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-gray-900 dark:shadow-black/50">
				<ModalHeader title={translate('admin.userDetails')} onClose={closeModal} />

				<div className="grid gap-6">
					<section className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950">
						<p className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
							{translate('admin.accountInformation')}
						</p>
						<div className="mt-4 grid gap-4 text-sm text-gray-700 dark:text-gray-200">
							<div>
								<div className="flex flex-wrap items-center gap-2">
									<p className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</p>
									{user.isShadow && (
										<span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
											{translate('admin.shadowUser')}
										</span>
									)}
								</div>
								<p className="text-sm text-gray-500 dark:text-gray-400">{user.email ?? '—'}</p>
							</div>

							<div className="flex items-center gap-2 rounded-2xl bg-gray-100 p-3 dark:bg-gray-800">
								<code className="flex-1 font-mono text-xs break-all text-gray-700 dark:text-gray-300">
									{user.id}
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

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.phone')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{user.phone || '-'}</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.role')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">{user.role}</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.emailStatus')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{user.emailVerified ? translate('admin.verified') : translate('admin.pending')}
									</p>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.createdAt')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatDateTime(user.createdAt, localeIntl[locale])}
									</p>
								</div>
								<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-900">
									<p className="text-xs tracking-[0.18em] text-gray-500 uppercase dark:text-gray-400">
										{translate('admin.updatedAt')}
									</p>
									<p className="mt-1 font-medium text-gray-900 dark:text-white">
										{formatDateTime(user.updatedAt, localeIntl[locale])}
									</p>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
		</Modal>
	);
}
