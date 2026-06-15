import { formatDateTime } from '@/utils/date';
import { BookingWithEstimate, estimateStripeFeeInCents } from '@event-space/shared';

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
			return `$0 (${refundPercentage}% refund doesn't cover the ~$${feeInDollars} processing fee)`;
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
				`Cancel before ${lowerBoundDeadline} to get ${refundDescriptionFor(rule.refundPercentage)} back`,
			);
		} else {
			const upperBoundDeadline = formatDateTime(deadlineFor(sortedRules[index - 1].hoursBeforeEvent));
			lines.push(
				`Cancel between ${upperBoundDeadline} and ${lowerBoundDeadline} to get ${refundDescriptionFor(rule.refundPercentage)} back`,
			);
		}
	});

	const lastRule = sortedRules[sortedRules.length - 1];
	lines.push(`No refund after ${formatDateTime(deadlineFor(lastRule.hoursBeforeEvent))}`);

	return (
		<div className="rounded-md border border-gray-200 p-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
			<p className="mb-1 font-medium text-gray-800 dark:text-white">Cancellation policy</p>
			<p className="mb-2 text-xs">
				The closer to the event you cancel, the more was likely already spent preparing it — so the
				refund percentage gets smaller. The processing fee in parentheses is also non-refundable and
				subtracted from the total.
			</p>
			<ul className="space-y-1">
				{lines.map((line, i) => (
					<li key={i}>{line}</li>
				))}
			</ul>
			<p className="mt-2 text-xs italic">
				Refund amounts are approximate and may vary slightly based on actual payment processing fees.
			</p>
		</div>
	);
}
