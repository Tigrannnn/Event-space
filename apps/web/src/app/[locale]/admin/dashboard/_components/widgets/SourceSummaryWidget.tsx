'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useSourceStats } from '@/features/admin/hooks/useAdmin';
import { useSourceLabel } from '@/hooks/labels/useSourceLabel';
import { useTranslation } from '@/hooks/translation';
import { localizePath } from '@/lib/i18n/config';

interface SourceSummaryWidgetProps {
	from: string;
	to: string;
}

const TOP_SOURCES = 3;

export default function SourceSummaryWidget({ from, to }: SourceSummaryWidgetProps) {
	const translate = useTranslation();
	const sourceLabel = useSourceLabel();
	const { data, isLoading } = useSourceStats(from, to);

	const href = `${localizePath('/admin/statistics', translate.locale)}?from=${from}&to=${to}`;
	const top = (data?.rows ?? []).filter((row) => row.source && row.visitors > 0).slice(0, TOP_SOURCES);

	const numbers = [
		{ label: translate('admin.statsVisitors'), value: data?.totals.visitors },
		{ label: translate('admin.statsViewedTours'), value: data?.totals.viewedTours },
		{ label: translate('admin.statsStartedBooking'), value: data?.totals.startedBooking },
		{ label: translate('admin.statsSiteBookings'), value: data?.totals.siteBookings },
	];

	return (
		<section className="rounded-lg border border-gray-500 p-5 shadow-sm">
			<div className="mb-4 flex items-center justify-between gap-3">
				<h2 className="font-semibold text-gray-900 dark:text-gray-100">{translate('admin.statsSummaryTitle')}</h2>
				<Link href={href} className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline">
					{translate('admin.statsMore')}
					<ArrowRight className="h-4 w-4" />
				</Link>
			</div>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{numbers.map((item) => (
					<div key={item.label} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
						<p className="text-xs text-gray-500">{item.label}</p>
						<p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
							{isLoading ? '…' : (item.value ?? 0)}
						</p>
					</div>
				))}
			</div>

			{top.length > 0 && (
				<p className="mt-3 text-sm text-gray-500">
					{translate('admin.statsTopSources')}:{' '}
					{top.map((row) => `${sourceLabel(row)} — ${row.visitors}`).join(', ')}
				</p>
			)}
		</section>
	);
}
