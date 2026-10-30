'use client';

import { quoteBooking, type EventOccurrence } from '@event-space/shared';
import { useFormatCurrency, useFormatDate } from '@/hooks/format';
import { useTranslation } from '@/hooks/translation';
import { cn } from '@/utils/cn';
import { ScrollFade } from '@/components/ui/ScrollFade';
import type { OccurrencePickerProps } from './OccurrencePicker';

interface OccurrenceChipsProps extends OccurrencePickerProps {
	/** A form that books a date cannot offer one the visitor already holds. */
	disableBooked?: boolean;
}

const spotsOf = (occurrence: EventOccurrence): number =>
	Math.max(0, occurrence.maxParticipants - occurrence.currentParticipants);

/**
 * The minimal skin's date choice: every upcoming date laid out as a tile rather than hidden
 * behind a dropdown, so the dates, their times and their prices can be compared at a glance.
 */
export function OccurrenceChips({
	occurrences,
	selectedId,
	onSelect,
	price,
	isBooked,
	disabled = false,
	disableBooked = false,
}: OccurrenceChipsProps) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const { formatDateShort, formatTime } = useFormatDate();

	return (
		<ScrollFade role="radiogroup" className="grid max-h-72 grid-cols-2 gap-2 p-0.5">
			{occurrences.map((occurrence) => {
				const spots = spotsOf(occurrence);
				const isSoldOut = spots === 0;
				const booked = isBooked?.(occurrence.id) ?? false;
				const isSelected = occurrence.id === selectedId;
				const quote = quoteBooking(
					{ price, discountPercent: occurrence.discountPercent },
					{ quantity: 1 },
				);
				const note = isSoldOut
					? translate('booking.soldOut')
					: booked
						? translate('booking.alreadyBooked')
						: `${spots} ${translate('booking.spotsLeft')}`;

				return (
					<button
						key={occurrence.id}
						type="button"
						role="radio"
						aria-checked={isSelected}
						disabled={disabled || isSoldOut || (disableBooked && booked)}
						onClick={() => onSelect(occurrence.id)}
						className={cn(
							'flex flex-col rounded-xl border px-3 py-2.5 text-left transition-colors',
							isSelected
								? 'border-gray-900 ring-1 ring-gray-900 dark:border-white dark:ring-white'
								: 'border-gray-300 hover:border-gray-900 dark:border-neutral-700 dark:hover:border-gray-300',
							(isSoldOut || booked) && 'opacity-60',
							(isSoldOut || (disableBooked && booked)) && 'cursor-not-allowed',
						)}
					>
						<span className="text-[15px] font-semibold text-gray-900 dark:text-white">
							{formatDateShort(occurrence.date)}
						</span>
						<span className="text-sm text-gray-500 dark:text-gray-400">
							{formatTime(occurrence.date)}
						</span>
						<span
							className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 text-sm font-medium text-gray-900 dark:text-white"
							suppressHydrationWarning
						>
							{formatCurrency(quote.unitPrice)}
							{quote.discountPercent > 0 && (
								<span className="text-xs font-normal text-gray-400 line-through">
									{formatCurrency(quote.baseUnitPrice)}
								</span>
							)}
						</span>
						<span className="text-xs text-gray-500 dark:text-gray-400">{note}</span>
					</button>
				);
			})}
		</ScrollFade>
	);
}
