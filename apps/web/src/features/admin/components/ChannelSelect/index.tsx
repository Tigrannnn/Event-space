'use client';

import { useState } from 'react';
import { CHANNEL_NAME_MAX } from '@event-space/shared';
import Button from '@/components/ui/Buttons/Button';
import Input from '@/components/ui/Inputs/Input';
import Select from '@/components/ui/Select';
import { useAdminChannels, useCreateChannel } from '@/features/admin/hooks/useAdmin';
import { useChannelLabel } from '@/hooks/labels/useChannelLabel';
import { useTranslation } from '@/hooks/translation';

const ADD_NEW = '__add__';

interface ChannelSelectProps {
	use: 'bookings' | 'reviews';
	value: string;
	onChange: (channelId: string) => void;
	label: string;
	disabled?: boolean;
}

/** Picks a channel, and lets the admin add one that is missing without leaving the form. */
export default function ChannelSelect({ use, value, onChange, label, disabled }: ChannelSelectProps) {
	const translate = useTranslation();
	const channelLabel = useChannelLabel();
	const { data: channels = [] } = useAdminChannels(use === 'bookings' ? { forBookings: true } : { forReviews: true });
	const { mutate: createChannel, isPending } = useCreateChannel();

	const [adding, setAdding] = useState(false);
	const [name, setName] = useState('');

	const save = () => {
		const trimmed = name.trim();
		if (!trimmed) return;

		createChannel(
			{ name: trimmed, forBookings: use === 'bookings', forReviews: use === 'reviews' },
			{
				onSuccess: (channel) => {
					onChange(channel.id);
					setAdding(false);
					setName('');
				},
			},
		);
	};

	if (adding) {
		return (
			<div className="flex flex-col gap-1.5">
				<Input
					label={translate('admin.channelName')}
					value={name}
					onChange={(event) => setName(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							event.preventDefault();
							save();
						}
					}}
					maxLength={CHANNEL_NAME_MAX}
					placeholder={translate('admin.channelNamePlaceholder')}
					disabled={isPending}
					autoFocus
				/>
				<div className="flex gap-2">
					<Button type="button" size="sm" onClick={save} isLoading={isPending} disabled={!name.trim()}>
						{translate('admin.addChannel')}
					</Button>
					<Button type="button" size="sm" variant="secondary" onClick={() => setAdding(false)} disabled={isPending}>
						{translate('booking.close')}
					</Button>
				</div>
			</div>
		);
	}

	const options = [
		...channels.map((channel) => ({ value: channel.id, label: channelLabel(channel) })),
		{ value: ADD_NEW, label: translate('admin.addChannelOption') },
	];

	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-sm font-semibold">{label}</span>
			<Select
				value={value}
				onValueChange={(next) => (next === ADD_NEW ? setAdding(true) : onChange(next))}
				disabled={disabled}
				className="w-full font-medium"
				options={options}
			/>
		</div>
	);
}
