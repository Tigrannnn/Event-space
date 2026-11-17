'use client';

import { useState } from 'react';
import { SYSTEM_CHANNEL_IDS, type BookingWithDetails } from '@event-space/shared';
import Input from '@/components/ui/Inputs/Input';
import Button from '@/components/ui/Buttons/Button';
import ChannelSelect from '@/features/admin/components/ChannelSelect';
import { useUpdateBookingChannel } from '@/features/admin/hooks/useAdmin';
import { useTranslation } from '@/hooks/translation';

interface BookingChannelFormProps {
	booking: BookingWithDetails;
	onDone: () => void;
}

export default function BookingChannelForm({ booking, onDone }: BookingChannelFormProps) {
	const translate = useTranslation();
	const { mutate: updateChannel, isPending } = useUpdateBookingChannel();

	const [channelId, setChannelId] = useState(booking.channelId);
	const [externalId, setExternalId] = useState(booking.externalId ?? '');

	const handleSubmit = (formEvent: React.FormEvent) => {
		formEvent.preventDefault();

		updateChannel(
			{
				id: booking.id,
				data: {
					channelId,
					externalId: channelId === SYSTEM_CHANNEL_IDS.UNSPECIFIED ? null : externalId.trim() || null,
				},
			},
			{ onSuccess: onDone },
		);
	};

	return (
		<form className="mt-2 space-y-3" onSubmit={handleSubmit}>
			<ChannelSelect
				use="bookings"
				value={channelId}
				onChange={setChannelId}
				label={translate('admin.bookingChannel')}
				disabled={isPending}
			/>

			{channelId !== SYSTEM_CHANNEL_IDS.UNSPECIFIED && (
				<Input
					label={translate('admin.bookingExternalId')}
					value={externalId}
					onChange={(changeEvent) => setExternalId(changeEvent.target.value)}
					placeholder={translate('admin.bookingExternalIdPlaceholder')}
					disabled={isPending}
				/>
			)}

			<div className="flex justify-end gap-2">
				<Button type="button" size="xs" variant="secondary" onClick={onDone} disabled={isPending}>
					{translate('admin.cancel')}
				</Button>
				<Button type="submit" size="xs" isLoading={isPending}>
					{translate('admin.saveChanges')}
				</Button>
			</div>
		</form>
	);
}
