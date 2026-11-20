'use client';

import { useState } from 'react';
import { Archive, ArchiveRestore, Copy, Pencil, Plus, QrCode } from 'lucide-react';
import type { Source } from '@event-space/shared';
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
import { useAdminSources, useUpdateSource } from '@/features/admin/hooks/useAdmin';
import { sourceLink } from '@/features/admin/sources/sourceLink';
import { useCopyToClipboard } from '@/hooks/clipboard';
import { useTranslation } from '@/hooks/translation';
import { ModalType, useModalStore } from '@/stores';

export default function SourcesTable() {
	const translate = useTranslation();
	const copyToClipboard = useCopyToClipboard();
	const { openModal } = useModalStore();
	const { data, isLoading } = useAdminSources({ includeArchived: true });
	const { mutate: updateSource } = useUpdateSource();
	const [pendingId, setPendingId] = useState<string | null>(null);

	const sources = data ?? [];

	const toggleArchived = (source: Source) => {
		setPendingId(source.id);
		updateSource(
			{ id: source.id, data: { isActive: !source.isActive } },
			{ onSettled: () => setPendingId(null) },
		);
	};

	return (
		<div className="space-y-6">
			<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
				<div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
					<div>
						<p className="text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100">
							{translate('admin.sources')}
						</p>
						<p className="text-xs text-gray-500 sm:text-sm">{translate('admin.sourcesHint')}</p>
					</div>
					<Button
						type="button"
						size="sm"
						className="max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
						onClick={() => openModal(ModalType.SourceForm, null)}
					>
						<Plus className="h-4 w-4" />
						{translate('admin.addSource')}
					</Button>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="px-3 sm:px-5">{translate('admin.sourceName')}</TableHead>
							<TableHead>{translate('admin.sourceLink')}</TableHead>
							<TableHead>{translate('admin.actions')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{!isLoading && sources.length === 0 && (
							<TableRow>
								<TableCell colSpan={3} className="px-3 py-8 text-center text-gray-500 sm:px-5">
									{translate('admin.noSources')}
								</TableCell>
							</TableRow>
						)}
						{sources.map((source) => (
							<TableRow key={source.id} className={source.isActive ? undefined : 'opacity-60'}>
								<TableCell className="px-3 sm:px-5">
									<div className="flex flex-wrap items-center gap-2">
										<span className="font-medium">{source.name}</span>
										{!source.isActive && (
											<Badge label={translate('admin.sourceArchived')} variant="warning" />
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<span className="max-w-64 truncate font-mono text-xs text-gray-600 dark:text-gray-300">
											{sourceLink(source.code)}
										</span>
										<Button
											type="button"
											size="xs"
											variant="secondary"
											title={translate('admin.sourceCopyLink')}
											aria-label={translate('admin.sourceCopyLink')}
											onClick={() => void copyToClipboard(sourceLink(source.code), 'admin.sourceLinkCopied')}
										>
											<Copy className="h-4 w-4" />
										</Button>
										<Button
											type="button"
											size="xs"
											variant="secondary"
											title={translate('admin.sourceShowQr')}
											aria-label={translate('admin.sourceShowQr')}
											onClick={() => openModal(ModalType.SourceQr, { source })}
										>
											<QrCode className="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button
											type="button"
											size="xs"
											variant="secondary"
											title={translate('admin.editSource')}
											aria-label={translate('admin.editSource')}
											onClick={() => openModal(ModalType.SourceForm, { source })}
										>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											type="button"
											size="xs"
											variant="secondary"
											title={translate(source.isActive ? 'admin.sourceArchive' : 'admin.sourceRestore')}
											aria-label={translate(source.isActive ? 'admin.sourceArchive' : 'admin.sourceRestore')}
											disabled={pendingId === source.id}
											onClick={() => toggleArchived(source)}
										>
											{source.isActive ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
