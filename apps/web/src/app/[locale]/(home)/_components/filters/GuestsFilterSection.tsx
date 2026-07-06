'use client';

import { MinusIcon, PlusIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/translation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { FilterTriggerButton } from './FilterTriggerButton';
import type { EventsFiltersState } from './types';

const MIN_GUESTS = 1;
const MAX_GUESTS = 20;

interface GuestsFilterSectionProps {
	filters: EventsFiltersState;
	onFiltersChange: (filters: EventsFiltersState) => void;
	variant?: 'popover' | 'inline';
}

export function GuestsFilterSection({
	filters,
	onFiltersChange,
	variant = 'popover',
}: GuestsFilterSectionProps) {
	const translate = useTranslation();
	const guestCount = filters.guests ?? MIN_GUESTS;
	const isApplied = filters.guests !== null && filters.guests > 0;

	const label =
		isApplied && filters.guests !== null
			? translate('filters.guestsCount').replace('{count}', String(filters.guests))
			: translate('filters.guests');

	const updateGuests = (nextCount: number) => {
		const clamped = Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, nextCount));
		onFiltersChange({ ...filters, guests: clamped });
	};

	const handleDecrement = () => {
		if (filters.guests === null) {
			onFiltersChange({ ...filters, guests: MIN_GUESTS });
			return;
		}
		updateGuests(guestCount - 1);
	};

	const handleIncrement = () => {
		updateGuests((filters.guests ?? MIN_GUESTS) + 1);
	};

	const stepperContent = (
		<>
			<div className="space-y-1">
				<p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
					{translate('filters.guests')}
				</p>
				<p className="text-xs text-gray-500 dark:text-gray-400">{translate('filters.guestsHint')}</p>
			</div>
			<div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200/80 bg-white px-3 py-2 dark:border-gray-600/60 dark:bg-gray-800/80">
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					onClick={handleDecrement}
					disabled={filters.guests !== null && guestCount <= MIN_GUESTS}
				>
					<MinusIcon className="size-4" />
				</Button>
				<span className="min-w-8 text-center text-base font-semibold">{guestCount}</span>
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					onClick={handleIncrement}
					disabled={guestCount >= MAX_GUESTS}
				>
					<PlusIcon className="size-4" />
				</Button>
			</div>
		</>
	);

	if (variant === 'inline') {
		return (
			<div className="rounded-3xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700/70 dark:bg-gray-800/80">
				{stepperContent}
			</div>
		);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<FilterTriggerButton isActive={isApplied}>
					<UsersIcon className="size-4 text-primary/80" />
					{label}
				</FilterTriggerButton>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-72 rounded-3xl p-4 shadow-lg">
				{stepperContent}
			</PopoverContent>
		</Popover>
	);
}
