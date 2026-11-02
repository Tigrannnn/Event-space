'use client';

import { useState } from 'react';
import { Archive, ArchiveRestore, Pencil, Plus } from 'lucide-react';
import type { ChannelWithUsage } from '@event-space/shared';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Buttons/Button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/Table';
import { useAdminChannels, useUpdateChannel } from '@/features/admin/hooks/useAdmin';
import { useChannelLabel } from '@/hooks/labels/useChannelLabel';
import { useTranslation } from '@/hooks/translation';
import { ModalType, useModalStore } from '@/stores';

export default function ChannelsTable() {
	const translate = useTranslation();
	const channelLabel = useChannelLabel();
	const { openModal } = useModalStore();
	const { data: channels = [], isLoading } = useAdminChannels({ includeArchived: true });
	const { mutate: updateChannel } = useUpdateChannel();
	const [pendingId, setPendingId] = useState<string | null>(null);

	const toggleArchived = (channel: ChannelWithUsage) => {
		setPendingId(channel.id);
		updateChannel(
			{ id: channel.id, data: { isActive: !channel.isActive } },
			{ onSettled: () => setPendingId(null) },
		);
	};

	const usedFor = (channel: ChannelWithUsage) =>
		[
			channel.forBookings && translate('admin.channelForBookings'),
			channel.forReviews && translate('admin.channelForReviews'),
		]
			.filter(Boolean)
			.join(', ');

	return (
		<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
			<div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
				<div>
					<p className="text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100">
						{translate('admin.channels')}
					</p>
					<p className="text-xs text-gray-500 sm:text-sm">{translate('admin.channelsHint')}</p>
				</div>
				<Button
					type="button"
					size="sm"
					className="max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
					onClick={() => openModal(ModalType.ChannelForm, null)}
				>
					<Plus className="h-4 w-4" />
					{translate('admin.addChannel')}
				</Button>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="px-3 sm:px-5">{translate('admin.channelName')}</TableHead>
						<TableHead>{translate('admin.channelUsedFor')}</TableHead>
						<TableHead>{translate('admin.bookings')}</TableHead>
						<TableHead>{translate('admin.reviews')}</TableHead>
						<TableHead>{translate('admin.actions')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{!isLoading && channels.length === 0 && (
						<TableRow>
							<TableCell colSpan={5} className="px-3 py-8 text-center text-gray-500 sm:px-5">
								{translate('admin.noChannels')}
							</TableCell>
						</TableRow>
					)}
					{channels.map((channel) => (
						<TableRow key={channel.id} className={channel.isActive ? undefined : 'opacity-60'}>
							<TableCell className="px-3 sm:px-5">
								<div className="flex flex-wrap items-center gap-2">
									<span className="font-medium">{channelLabel(channel)}</span>
									{channel.isSystem && <Badge label={translate('admin.channelSystem')} variant="info" />}
									{!channel.isActive && (
										<Badge label={translate('admin.channelArchived')} variant="warning" />
									)}
								</div>
							</TableCell>
							<TableCell>{usedFor(channel) || '—'}</TableCell>
							<TableCell>{channel.bookingsCount}</TableCell>
							<TableCell>{channel.reviewsCount}</TableCell>
							<TableCell>
								{!channel.isSystem && (
									<div className="flex gap-2">
										<Button
											type="button"
											size="xs"
											variant="secondary"
											title={translate('admin.editChannel')}
											aria-label={translate('admin.editChannel')}
											onClick={() => openModal(ModalType.ChannelForm, { channel })}
										>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											type="button"
											size="xs"
											variant="secondary"
											title={translate(channel.isActive ? 'admin.channelArchive' : 'admin.channelRestore')}
											aria-label={translate(channel.isActive ? 'admin.channelArchive' : 'admin.channelRestore')}
											disabled={pendingId === channel.id}
											onClick={() => toggleArchived(channel)}
										>
											{channel.isActive ? (
												<Archive className="h-4 w-4" />
											) : (
												<ArchiveRestore className="h-4 w-4" />
											)}
										</Button>
									</div>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
