'use client';

import { useState } from 'react';
import { CHANNEL_NAME_MAX } from '@event-space/shared';
import { Modal, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import Input from '@/components/ui/Inputs/Input';
import { useCreateChannel, useUpdateChannel } from '@/features/admin/hooks/useAdmin';
import { useModalData, useModalStore } from '@/stores/modalStore';
import { ModalType } from '@/stores';
import { useTranslation } from '@/hooks/translation';

export default function ChannelFormModal() {
	const translate = useTranslation();
	const { closeModal } = useModalStore();
	const channel = useModalData(ModalType.ChannelForm)?.channel;

	const create = useCreateChannel();
	const update = useUpdateChannel();
	const isPending = create.isPending || update.isPending;

	const [name, setName] = useState(channel?.name ?? '');
	const [forBookings, setForBookings] = useState(channel?.forBookings ?? true);
	const [forReviews, setForReviews] = useState(channel?.forReviews ?? false);

	const canSubmit = name.trim() !== '' && (forBookings || forReviews);

	const submit = () => {
		if (!canSubmit) return;

		const data = { name: name.trim(), forBookings, forReviews };
		const options = { onSuccess: closeModal };

		if (channel) update.mutate({ id: channel.id, data }, options);
		else create.mutate(data, options);
	};

	return (
		<Modal
			onClose={closeModal}
			size="md"
			ariaLabel={translate(channel ? 'admin.editChannel' : 'admin.addChannel')}
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
				<ModalHeader title={translate(channel ? 'admin.editChannel' : 'admin.addChannel')} onClose={closeModal} />

				<Input
					label={translate('admin.channelName')}
					value={name}
					onChange={(event) => setName(event.target.value)}
					maxLength={CHANNEL_NAME_MAX}
					placeholder={translate('admin.channelNamePlaceholder')}
					disabled={isPending}
					autoFocus
				/>

				<div className="space-y-2">
					<span className="text-sm font-semibold">{translate('admin.channelUsedFor')}</span>
					<label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
						<input
							type="checkbox"
							checked={forBookings}
							onChange={(event) => setForBookings(event.target.checked)}
							className="h-4 w-4"
						/>
						{translate('admin.channelForBookings')}
					</label>
					<label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
						<input
							type="checkbox"
							checked={forReviews}
							onChange={(event) => setForReviews(event.target.checked)}
							className="h-4 w-4"
						/>
						{translate('admin.channelForReviews')}
					</label>
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
