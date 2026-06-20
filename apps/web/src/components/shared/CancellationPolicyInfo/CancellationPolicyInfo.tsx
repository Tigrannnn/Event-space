'use client';

import { formatDateTime } from '@/utils/date';
import { BookingWithEstimate, estimateStripeFeeInCents } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

export interface CancellationPolicyInfoProps {
	eventDate: Date | string;
	price: number;
	cancellationRules: { id?: string; hoursBeforeEvent: number; refundPercentage: number }[];
	booking?: BookingWithEstimate;
}

export default function CancellationPolicyInfo({
	eventDate,
	price,
	cancellationRules,
	booking,
}: CancellationPolicyInfoProps) {
	const translate = useTranslation();

	if (!cancellationRules || cancellationRules.length === 0) {
		return null;
	}

	const sortedRules = [...cancellationRules].sort((a, b) => b.hoursBeforeEvent - a.hoursBeforeEvent);

	const date = new Date(eventDate);
	if (isNaN(date.getTime())) {
		return null;
	}

	const deadlineFor = (hoursBeforeEvent: number) =>
		new Date(date.getTime() - hoursBeforeEvent * 60 * 60 * 1000);

	const baseAmountInCents = booking
		? Math.round(Number(booking.amount) * 100)
		: Math.round(Number(price) * 100);

	const stripeFeeInCents = estimateStripeFeeInCents(baseAmountInCents / 100);

	const refundDescriptionFor = (refundPercentage: number) => {
		const refundInCents = Math.round((baseAmountInCents * refundPercentage) / 100);
		const afterFee = Math.max(0, refundInCents - stripeFeeInCents);
		const feeInDollars = (stripeFeeInCents / 100).toFixed(2);
		
		if (afterFee <= 0) {
			return `$0 (${refundPercentage}% ${translate('cancellation.doesntCoverFee')} ~$${feeInDollars})`;
		}

		const afterFeeInDollars = (afterFee / 100).toFixed(2);
		return `~$${afterFeeInDollars} (${refundPercentage}% - ~$${feeInDollars})`;
	};

	const lines: string[] = [];

	sortedRules.forEach((rule, index) => {
		if (rule.refundPercentage === 0) return; // handled by final "no refund" line

		const lowerBoundDeadline = formatDateTime(deadlineFor(rule.hoursBeforeEvent));

		if (index === 0) {
			lines.push(
				`${translate('cancellation.cancelBefore')} ${lowerBoundDeadline} ${translate('cancellation.toGet')} ${refundDescriptionFor(rule.refundPercentage)} ${translate('cancellation.back')}`,
			);
		} else {
			const upperBoundDeadline = formatDateTime(deadlineFor(sortedRules[index - 1].hoursBeforeEvent));
			lines.push(
				`${translate('cancellation.cancelBetween')} ${upperBoundDeadline} ${translate('cancellation.and')} ${lowerBoundDeadline} ${translate('cancellation.toGet')} ${refundDescriptionFor(rule.refundPercentage)} ${translate('cancellation.back')}`,
			);
		}
	});

	const lastRule = sortedRules[sortedRules.length - 1];
	lines.push(`${translate('cancellation.noRefundAfter')} ${formatDateTime(deadlineFor(lastRule.hoursBeforeEvent))}`);

	return (
		<div className="rounded-md border border-gray-200 p-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
			<p className="mb-1 font-medium text-gray-800 dark:text-white">{translate('cancellation.title')}</p>
			<p className="mb-2 text-xs">{translate('cancellation.description')}</p>
			<ul className="space-y-1">
				{lines.map((line, i) => (
					<li key={i}>{line}</li>
				))}
			</ul>
			<p className="mt-2 text-xs italic">
				{translate('cancellation.feeNote')}
			</p>
		</div>
	);
}
