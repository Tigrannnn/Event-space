'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Archive, ArchiveRestore, Copy, Pencil, Plus, QrCode } from 'lucide-react';
import {
	SOURCE_FILTER_NONE,
	SOURCE_FILTER_UNKNOWN,
	type SourceTotals,
	type SourceWithStats,
} from '@event-space/shared';
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
import { useFormatCurrency } from '@/hooks/format';
import { useTranslation } from '@/hooks/translation';
import { localizePath, type Locale } from '@/lib/i18n/config';
import { ModalType, useModalStore } from '@/stores';

function bookingsHref(source: string, locale: Locale) {
	return `${localizePath('/admin/bookings', locale)}?source=${encodeURIComponent(source)}`;
}

export default function SourcesTable() {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const copyToClipboard = useCopyToClipboard();
	const { openModal } = useModalStore();
	const { data, isLoading } = useAdminSources({ includeArchived: true });
	const { mutate: updateSource } = useUpdateSource();
	const [pendingId, setPendingId] = useState<string | null>(null);

	const sources = data?.sources ?? [];
	const unknown = data?.unknown ?? [];

	const toggleArchived = (source: SourceWithStats) => {
		setPendingId(source.id);
		updateSource(
			{ id: source.id, data: { isActive: !source.isActive } },
			{ onSettled: () => setPendingId(null) },
		);
	};

	const totalsCells = (totals: SourceTotals, filter: string) => (
		<>
			<TableCell>
				{totals.bookings > 0 ? (
					<Link href={bookingsHref(filter, translate.locale)} className="text-primary hover:underline">
						{totals.bookings}
					</Link>
				) : (
					0
				)}
			</TableCell>
			<TableCell>{totals.guests}</TableCell>
			<TableCell className="whitespace-nowrap">{formatCurrency(totals.amount)}</TableCell>
			<TableCell className="whitespace-nowrap">{formatCurrency(totals.paid)}</TableCell>
		</>
	);

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
							<TableHead>{translate('admin.sourceBookings')}</TableHead>
							<TableHead>{translate('admin.sourceGuests')}</TableHead>
							<TableHead>{translate('admin.sourceAmount')}</TableHead>
							<TableHead>{translate('admin.sourcePaid')}</TableHead>
							<TableHead>{translate('admin.actions')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{!isLoading && sources.length === 0 && (
							<TableRow>
								<TableCell colSpan={7} className="px-3 py-8 text-center text-gray-500 sm:px-5">
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
										<span className="font-mono text-xs text-gray-600 dark:text-gray-300">?ref={source.code}</span>
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
								{totalsCells(source.totals, source.id)}
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
						{data && (
							<TableRow className="text-gray-500">
								<TableCell className="px-3 italic sm:px-5">{translate('admin.sourceUnspecified')}</TableCell>
								<TableCell>—</TableCell>
								{totalsCells(data.unspecified, SOURCE_FILTER_NONE)}
								<TableCell />
							</TableRow>
						)}
					</TableBody>
				</Table>
				<p className="border-t border-gray-300 px-3 py-2 text-xs text-gray-500 sm:px-5 dark:border-gray-700">
					{translate('admin.sourceTotalsHint')}
				</p>
			</div>

			{unknown.length > 0 && (
				<div className="overflow-hidden rounded-lg border border-amber-400 shadow-sm">
					<div className="px-3 py-3 sm:px-5 sm:py-4">
						<p className="text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100">
							{translate('admin.sourceUnknownTitle')}
						</p>
						<p className="text-xs text-gray-500 sm:text-sm">{translate('admin.sourceUnknownHint')}</p>
					</div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="px-3 sm:px-5">{translate('admin.sourceCode')}</TableHead>
								<TableHead>{translate('admin.sourceBookings')}</TableHead>
								<TableHead>{translate('admin.sourceGuests')}</TableHead>
								<TableHead>{translate('admin.sourceAmount')}</TableHead>
								<TableHead>{translate('admin.sourcePaid')}</TableHead>
								<TableHead>{translate('admin.actions')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{unknown.map((row) => (
								<TableRow key={row.ref}>
									<TableCell className="px-3 font-mono text-sm sm:px-5">{row.ref}</TableCell>
									{totalsCells(row.totals, SOURCE_FILTER_UNKNOWN)}
									<TableCell>
										<Button
											type="button"
											size="xs"
											variant="secondary"
											onClick={() => openModal(ModalType.SourceForm, { code: row.ref })}
										>
											<Plus className="h-4 w-4" />
											{translate('admin.sourceCreateFromRef')}
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}
