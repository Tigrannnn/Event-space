'use client';

import { quoteBooking, type EventOccurrence } from '@event-space/shared';
import { useFormatCurrency, useFormatDate } from '@/hooks/format';
import { useTranslation } from '@/hooks/translation';
import { cn } from '@/utils/cn';
import { ScrollFade } from '@/components/ui/ScrollFade';
import type { OccurrencePickerProps } from './OccurrencePicker';

interface OccurrencePillsProps extends OccurrencePickerProps {
	/** A form that books a date cannot offer one the visitor already holds. */
	disableBooked?: boolean;
}

const spotsOf = (occurrence: EventOccurrence): number =>
	Math.max(0, occurrence.maxParticipants - occurrence.currentParticipants);

/**
 * The capsule skin's date choice: one long pill per date, the day of the month in a circle at its
 * start, the time and seats in the middle and the price at the end. The chosen one fills with the
 * brand's deep colour.
 */
export function OccurrencePills({
	occurrences,
	selectedId,
	onSelect,
	price,
	isBooked,
	disabled = false,
	disableBooked = false,
}: OccurrencePillsProps) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const { formatDateShort, formatTime } = useFormatDate();

	return (
		<ScrollFade role="radiogroup" className="flex max-h-80 flex-col gap-2 p-0.5">
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
				const day = new Date(occurrence.date).getDate();

				return (
					<button
						key={occurrence.id}
						type="button"
						role="radio"
						aria-checked={isSelected}
						disabled={disabled || isSoldOut || (disableBooked && booked)}
						onClick={() => onSelect(occurrence.id)}
						className={cn(
							'flex w-full items-center gap-3 rounded-full py-1.5 pr-5 pl-1.5 text-left transition-colors',
							isSelected
								? 'bg-primary text-white shadow-md'
								: 'text-primary bg-(--capsule-wash) hover:bg-(--capsule-line)',
							(isSoldOut || booked) && 'opacity-55',
							(isSoldOut || (disableBooked && booked)) && 'cursor-not-allowed',
						)}
					>
						<span
							className={cn(
								'flex size-11 shrink-0 items-center justify-center rounded-full text-lg font-black tabular-nums',
								isSelected ? 'text-primary bg-white' : 'text-primary bg-white shadow-sm',
							)}
							suppressHydrationWarning
						>
							{day}
						</span>
						<span className="min-w-0 flex-1">
							<span className="block truncate text-sm font-bold" suppressHydrationWarning>
								{formatDateShort(occurrence.date)} · {formatTime(occurrence.date)}
							</span>
							<span
								className={cn(
									'block truncate text-xs font-medium',
									isSelected ? 'text-white/70' : 'text-gray-500',
								)}
							>
								{note}
							</span>
						</span>
						<span className="flex shrink-0 flex-col items-end" suppressHydrationWarning>
							<span className="text-sm font-extrabold">{formatCurrency(quote.unitPrice)}</span>
							{quote.discountPercent > 0 && (
								<span
									className={cn(
										'text-[11px] font-medium line-through',
										isSelected ? 'text-white/50' : 'text-gray-400',
									)}
								>
									{formatCurrency(quote.baseUnitPrice)}
								</span>
							)}
						</span>
					</button>
				);
			})}
		</ScrollFade>
	);
}
