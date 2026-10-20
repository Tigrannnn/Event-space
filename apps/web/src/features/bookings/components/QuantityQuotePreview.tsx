'use client';

import type { ReactNode } from 'react';
import type { QuantityQuote } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useFormatCurrency } from '@/hooks/format';

interface QuantityQuotePreviewProps {
	quote?: QuantityQuote;
	isLoading: boolean;
	isError: boolean;
}

function Row({ label, value, strong }: { label: ReactNode; value?: ReactNode; strong?: boolean }) {
	return (
		<div className="flex items-start justify-between gap-4">
			<span
				className={
					strong ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
				}
			>
				{label}
			</span>
			{value !== undefined && (
				<span
					className={
						strong ? 'text-primary text-lg font-bold' : 'font-medium text-gray-900 dark:text-white'
					}
				>
					{value}
				</span>
			)}
		</div>
	);
}

export default function QuantityQuotePreview({
	quote,
	isLoading,
	isError,
}: QuantityQuotePreviewProps) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const money = (cents: number) => formatCurrency(cents / 100);

	if (isLoading) {
		return (
			<div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
				{translate('booking.quoteLoading')}
			</div>
		);
	}

	if (isError || !quote) {
		return (
			<div className="rounded-xl border border-red-300 p-4 text-sm text-red-600 dark:border-red-800 dark:text-red-400">
				{translate('booking.quoteFailed')}
			</div>
		);
	}

	const total = (
		<Row
			label={translate('booking.quoteTotal')}
			value={`${money(quote.currentAmountInCents)} → ${money(quote.newAmountInCents)}`}
		/>
	);

	if (quote.direction === 'INCREASE') {
		return (
			<div className="space-y-2 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-700">
				{total}
				<Row strong label={translate('booking.quoteDue')} value={money(quote.dueInCents)} />
			</div>
		);
	}

	const { refund } = quote;

	if (!refund) {
		return (
			<div className="space-y-2 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-700">
				{total}
				<Row label={translate('booking.quoteNoRefundChosen')} />
			</div>
		);
	}

	const consumedInCents = (quote.currentQuantity - quote.newQuantity) * quote.unitPriceInCents;
	const heldInCents = Math.max(0, consumedInCents - refund.grossInCents);
	const cashInCents = refund.parts
		.filter((part) => part.method === 'OFFLINE')
		.reduce((sum, part) => sum + part.netInCents, 0);
	const cardInCents = refund.netInCents - cashInCents;

	return (
		<div className="space-y-2 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-700">
			{total}
			<Row label={translate('booking.quoteRule', { percent: refund.percentage })} />
			{heldInCents > 0 && (
				<Row label={translate('booking.quoteHeld')} value={`−${money(heldInCents)}`} />
			)}
			{refund.feeWithheldInCents > 0 && (
				<Row label={translate('booking.quoteFee')} value={`−${money(refund.feeWithheldInCents)}`} />
			)}
			{cardInCents > 0 || cashInCents === 0 ? (
				cardInCents > 0 ? (
					<Row strong label={translate('booking.quoteRefund')} value={money(cardInCents)} />
				) : (
					<Row label={translate('booking.quoteNothing')} />
				)
			) : null}
			{cashInCents > 0 && (
				<Row label={translate('booking.quoteCash', { amount: money(cashInCents) })} />
			)}
		</div>
	);
}
