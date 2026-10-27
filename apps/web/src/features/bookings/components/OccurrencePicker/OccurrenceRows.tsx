'use client';

import { quoteBooking, type EventOccurrence } from '@event-space/shared';
import { useFormatCurrency, useFormatDate } from '@/hooks/format';
import { useTranslation } from '@/hooks/translation';
import { cn } from '@/utils/cn';
import type { OccurrencePickerProps } from './OccurrencePicker';

interface OccurrenceRowsProps extends OccurrencePickerProps {
	/** A form that books a date cannot offer one the visitor already holds. */
	disableBooked?: boolean;
}

const spotsOf = (occurrence: EventOccurrence): number =>
	Math.max(0, occurrence.maxParticipants - occurrence.currentParticipants);

/** A page is this many spots from full when a row starts to say so. */
const FEW_SPOTS = 5;

/**
 * The listing skin's date choice: one row per upcoming date with a radio on the left and the
 * price on the right, like the rows of rooms and rates on a booking page.
 */
export function OccurrenceRows({
	occurrences,
	selectedId,
	onSelect,
	price,
	isBooked,
	disabled = false,
	disableBooked = false,
}: OccurrenceRowsProps) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const { formatDateShort, formatTime } = useFormatDate();

	return (
		<div
			role="radiogroup"
			className="max-h-72 divide-y divide-gray-200 overflow-y-auto rounded-md border border-gray-300 dark:divide-neutral-800 dark:border-neutral-700"
		>
			{occurrences.map((occurrence) => {
				const spots = spotsOf(occurrence);
				const isSoldOut = spots === 0;
				const booked = isBooked?.(occurrence.id) ?? false;
				const isSelected = occurrence.id === selectedId;
				const quote = quoteBooking(
					{ price, discountPercent: occurrence.discountPercent },
					{ quantity: 1 },
				);
				const fewSpots = !isSoldOut && spots <= FEW_SPOTS;
				const note = isSoldOut
					? translate('booking.soldOut')
					: booked
						? translate('booking.alreadyBooked')
						: fewSpots
							? translate('event.onlySpotsLeft', { count: spots })
							: null;

				return (
					<button
						key={occurrence.id}
						type="button"
						role="radio"
						aria-checked={isSelected}
						disabled={disabled || isSoldOut || (disableBooked && booked)}
						onClick={() => onSelect(occurrence.id)}
						className={cn(
							'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
							isSelected ? 'bg-primary/8' : 'hover:bg-gray-50 dark:hover:bg-neutral-800/60',
							(isSoldOut || booked) && 'opacity-60',
							(isSoldOut || (disableBooked && booked)) && 'cursor-not-allowed',
						)}
					>
						<span
							className={cn(
								'flex size-4 shrink-0 items-center justify-center rounded-full border-2',
								isSelected ? 'border-primary' : 'border-gray-400 dark:border-neutral-500',
							)}
						>
							{isSelected && <span className="bg-primary size-2 rounded-full" />}
						</span>
						<span className="min-w-0 flex-1">
							<span className="block text-[15px] font-semibold text-gray-900 dark:text-white">
								{formatDateShort(occurrence.date)}, {formatTime(occurrence.date)}
							</span>
							{note && (
								<span
									className={cn(
										'block text-xs font-medium',
										fewSpots && !booked
											? 'text-red-600 dark:text-red-400'
											: 'text-gray-500 dark:text-gray-400',
									)}
								>
									{note}
								</span>
							)}
						</span>
						<span className="shrink-0 text-right" suppressHydrationWarning>
							{quote.discountPercent > 0 && (
								<span className="block text-xs text-gray-400 line-through">
									{formatCurrency(quote.baseUnitPrice)}
								</span>
							)}
							<span className="block text-[15px] font-bold text-gray-900 dark:text-white">
								{formatCurrency(quote.unitPrice)}
							</span>
						</span>
					</button>
				);
			})}
		</div>
	);
}
