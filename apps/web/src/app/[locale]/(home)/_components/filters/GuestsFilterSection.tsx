'use client';

import { useState } from 'react';
import { MinusIcon, PlusIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/translation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover';
import { Button } from '@/components/ui/primitives/button';
import { FilterPopoverActions, FilterTriggerButton } from '@/components/filters';
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
	const [draftGuests, setDraftGuests] = useState<number>(filters.guests ?? MIN_GUESTS);
	const [isOpen, setIsOpen] = useState(false);
	const isApplied = filters.guests !== null && filters.guests > 0;

	const label =
		isApplied && filters.guests !== null
			? translate('filters.guestsCount').replace('{count}', String(filters.guests))
			: translate('filters.guests');

	const updateDraftGuests = (nextCount: number) => {
		const clamped = Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, nextCount));
		setDraftGuests(clamped);

		// Inline sits inside the drawer, which has one apply button for every section, so each tap
		// goes straight into the drawer's own draft. In a popover the value is held back until apply.
		if (variant === 'inline') {
			onFiltersChange({ ...filters, guests: clamped });
		}
	};

	const handleDecrement = () => {
		updateDraftGuests(draftGuests - 1);
	};

	const handleIncrement = () => {
		updateDraftGuests(draftGuests + 1);
	};

	const handleApply = () => {
		onFiltersChange({ ...filters, guests: draftGuests });
		setIsOpen(false);
	};

	const handleReset = () => {
		onFiltersChange({ ...filters, guests: null });
		setDraftGuests(MIN_GUESTS);
		setIsOpen(false);
	};

	/**
	 * Reopening starts from what is actually applied, not from where the last abandoned edit
	 * stopped — otherwise closing without applying leaves the stepper lying about the filter.
	 */
	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) setDraftGuests(filters.guests ?? MIN_GUESTS);
		setIsOpen(nextOpen);
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
					disabled={draftGuests <= MIN_GUESTS}
				>
					<MinusIcon className="size-4" />
				</Button>
				<span className="min-w-8 text-center text-base font-semibold text-foreground dark:text-white">{draftGuests}</span>
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					onClick={handleIncrement}
					disabled={draftGuests >= MAX_GUESTS}
				>
					<PlusIcon className="size-4" />
				</Button>
			</div>
		</>
	);

	if (variant === 'inline') {
		// The drawer applies every section at once, so this one contributes only its stepper —
		// and writes straight to the drawer's draft as the user taps.
		return (
			<div className="rounded-3xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700/70 dark:bg-gray-800/80">
				{stepperContent}
			</div>
		);
	}

	return (
		<Popover open={isOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<FilterTriggerButton isActive={isApplied}>
					<UsersIcon className="size-4 text-primary/80" />
					{label}
				</FilterTriggerButton>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-72 rounded-3xl p-4 text-foreground shadow-lg dark:text-white">
				{stepperContent}
				<FilterPopoverActions onApply={handleApply} onReset={isApplied ? handleReset : undefined} />
			</PopoverContent>
		</Popover>
	);
}
