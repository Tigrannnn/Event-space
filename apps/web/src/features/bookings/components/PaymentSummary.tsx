'use client';

import { Calendar, Users } from 'lucide-react';
import { useSkin } from '@/providers/BrandProvider';
import { useTranslation } from '@/hooks/translation';

interface PaymentSummaryProps {
	title?: string;
	date?: string;
	quantity: number;
	total: string;
}

export default function PaymentSummary({ title, date, quantity, total }: PaymentSummaryProps) {
	const skin = useSkin();
	const translate = useTranslation();
	const spotsLabel = translate('booking.spots');
	const totalLabel = translate('booking.total');

	if (skin === 'minimal') {
		return (
			<div className="border-y border-gray-200 py-4 dark:border-neutral-800">
				{title && <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>}
				{date && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{date}</p>}
				<dl className="mt-3 space-y-1.5 text-sm">
					<div className="flex justify-between gap-4">
						<dt className="text-gray-500 dark:text-gray-400">{spotsLabel}</dt>
						<dd className="font-medium text-gray-900 tabular-nums dark:text-white">{quantity}</dd>
					</div>
					<div className="flex justify-between gap-4">
						<dt className="text-gray-500 dark:text-gray-400">{totalLabel}</dt>
						<dd className="font-semibold text-gray-900 tabular-nums dark:text-white">{total}</dd>
					</div>
				</dl>
			</div>
		);
	}

	if (skin === 'market') {
		return (
			<div className="rounded-2xl border border-gray-200 p-4 dark:border-neutral-700">
				{title && <p className="text-sm font-bold text-gray-900 dark:text-white">{title}</p>}
				{date && (
					<p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
						<Calendar className="size-4 shrink-0" />
						{date}
					</p>
				)}
				<div className="mt-3 flex items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-300">
					<span className="flex items-center gap-1.5">
						<Users className="size-4" />
						{spotsLabel}
					</span>
					<span className="font-semibold">{quantity}</span>
				</div>
				<div className="mt-3 flex items-baseline justify-between gap-4 border-t border-gray-200 pt-3 dark:border-neutral-700">
					<span className="text-sm text-gray-600 dark:text-gray-300">{totalLabel}</span>
					<span className="text-2xl font-bold text-gray-900 dark:text-white">{total}</span>
				</div>
			</div>
		);
	}

	if (skin === 'listing') {
		return (
			<div className="overflow-hidden rounded-md border border-gray-300 dark:border-neutral-700">
				{(title || date) && (
					<div className="bg-primary/5 border-b border-gray-300 px-4 py-3 dark:border-neutral-700">
						{title && <p className="text-sm font-bold text-gray-900 dark:text-white">{title}</p>}
						{date && (
							<p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
								<Calendar className="text-primary h-4 w-4 shrink-0" />
								{date}
							</p>
						)}
					</div>
				)}
				<div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
					<span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
						<Users className="text-primary h-4 w-4" />
						{spotsLabel}
					</span>
					<span className="font-semibold text-gray-900 dark:text-white">{quantity}</span>
				</div>
				<div className="flex items-center justify-between gap-4 border-t border-gray-300 bg-gray-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
					<span className="text-sm font-semibold text-gray-900 dark:text-white">{totalLabel}</span>
					<span className="text-primary text-xl font-bold">{total}</span>
				</div>
			</div>
		);
	}

	if (skin === 'soft') {
		return (
			<div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
				{title && (
					<p className="text-primary font-(family-name:--font-display) text-lg font-semibold">{title}</p>
				)}
				{date && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{date}</p>}
				<div className="mt-4 flex items-center justify-between gap-3">
					<span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
						<Users className="text-primary h-4 w-4" />
						{quantity}
					</span>
					<span className="from-primary to-accent bg-linear-to-r bg-clip-text font-(family-name:--font-display) text-2xl font-bold text-transparent">
						{total}
					</span>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-1 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
			{title && <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>}
			{date && <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>}
			<p className="text-sm text-gray-600 dark:text-gray-300">
				{spotsLabel}: <span className="font-medium">{quantity}</span>
			</p>
			<p className="text-sm text-gray-600 dark:text-gray-300">
				{totalLabel}: <span className="font-medium">{total}</span>
			</p>
		</div>
	);
}
