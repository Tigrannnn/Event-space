'use client';

import { useState } from 'react';
import { normalizeSourceRef, SOURCE_CODE_MAX, SOURCE_NAME_MAX } from '@event-space/shared';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import Input from '@/components/ui/Inputs/Input';
import { useCreateSource, useUpdateSource } from '@/features/admin/hooks/useAdmin';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useTranslation } from '@/hooks/translation';
import { sourceLink } from './sourceLink';

export default function SourceFormModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const modalData = useModalData(ModalType.SourceForm);
	const source = modalData?.source;

	const create = useCreateSource();
	const update = useUpdateSource();
	const isPending = create.isPending || update.isPending;

	const [name, setName] = useState(source?.name ?? '');
	const [code, setCode] = useState(source?.code ?? modalData?.code ?? '');

	const normalizedCode = normalizeSourceRef(code);
	const canSubmit = name.trim() !== '' && (source ? true : normalizedCode !== null);
	const title = translate(source ? 'admin.editSource' : 'admin.addSource');

	const submit = () => {
		if (!canSubmit) return;

		const options = { onSuccess: closeModal };

		if (source) update.mutate({ id: source.id, data: { name: name.trim() } }, options);
		else create.mutate({ name: name.trim(), code: normalizedCode as string }, options);
	};

	return (
		<Modal
			onClose={closeModal}
			size="md"
			ariaLabel={title}
			disableBackdropClose={isPending}
			disableEscapeClose={isPending}
		>
			<form
				className="space-y-5 p-4 sm:p-6"
				onSubmit={(event) => {
					event.preventDefault();
					submit();
				}}
			>
				<ModalHeader title={title} onClose={closeModal} />

				<Input
					label={translate('admin.sourceName')}
					value={name}
					onChange={(event) => setName(event.target.value)}
					maxLength={SOURCE_NAME_MAX}
					placeholder={translate('admin.sourceNamePlaceholder')}
					disabled={isPending}
					autoFocus
				/>

				<div className="space-y-1.5">
					<Input
						label={translate('admin.sourceCode')}
						value={code}
						onChange={(event) => setCode(event.target.value.toLowerCase().replace(/\s+/g, '-'))}
						maxLength={SOURCE_CODE_MAX}
						placeholder={translate('admin.sourceCodePlaceholder')}
						disabled={isPending || Boolean(source)}
						autoCapitalize="none"
						autoCorrect="off"
						spellCheck={false}
					/>
					<p className="text-xs text-gray-500">{translate('admin.sourceCodeHint')}</p>
					{normalizedCode && (
						<p className="font-mono text-xs break-all text-gray-700 dark:text-gray-300">
							{sourceLink(normalizedCode)}
						</p>
					)}
				</div>

				<div className="flex justify-end gap-2">
					<Button type="button" size="sm" variant="secondary" onClick={closeModal} disabled={isPending}>
						{translate('booking.close')}
					</Button>
					<Button type="submit" size="sm" isLoading={isPending} disabled={!canSubmit}>
						{translate('admin.saveChanges')}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
