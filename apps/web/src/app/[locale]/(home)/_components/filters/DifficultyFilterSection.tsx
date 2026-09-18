'use client';

import { useState } from 'react';
import { Mountain } from 'lucide-react';
import { EventDifficultyEnum, type EventDifficulty } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { useLabels } from '@/hooks/labels/useLabels';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover';
import { CategoryPill, FilterPopoverActions, FilterTriggerButton } from '@/components/filters';
import type { EventsFiltersState } from './types';

const DIFFICULTY_OPTIONS = EventDifficultyEnum.options;

interface DifficultyFilterSectionProps {
	filters: EventsFiltersState;
	onFiltersChange: (filters: EventsFiltersState) => void;
	variant?: 'popover' | 'inline';
}

function toggleDifficulty(list: EventDifficulty[], value: EventDifficulty): EventDifficulty[] {
	return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/**
 * The catalogue's difficulty filter: several levels at once, since "easy or moderate" is a real
 * thing to look for, and picking one level at a time would hide the rest of the choice.
 *
 * Inline (inside the mobile drawer) writes straight through to its draft — the drawer has one
 * apply button for every section, so this one doesn't add a second.
 */
export function DifficultyFilterSection({
	filters,
	onFiltersChange,
	variant = 'popover',
}: DifficultyFilterSectionProps) {
	const translate = useTranslation();
	const { EVENT_DIFFICULTY_LABELS } = useLabels();
	const [isOpen, setIsOpen] = useState(false);
	const [draftDifficulties, setDraftDifficulties] = useState<EventDifficulty[]>(filters.difficulties);

	const isApplied = filters.difficulties.length > 0;
	const label = isApplied
		? `${translate('event.difficulty')} · ${filters.difficulties.length}`
		: translate('event.difficulty');

	const handleApply = () => {
		onFiltersChange({ ...filters, difficulties: draftDifficulties });
		setIsOpen(false);
	};

	const handleReset = () => {
		onFiltersChange({ ...filters, difficulties: [] });
		setDraftDifficulties([]);
		setIsOpen(false);
	};

	/** Reopening starts from what is applied, so an abandoned edit doesn't linger in the pills. */
	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) setDraftDifficulties(filters.difficulties);
		setIsOpen(nextOpen);
	};

	const renderPills = (selected: EventDifficulty[], onToggle: (value: EventDifficulty) => void) =>
		DIFFICULTY_OPTIONS.map((difficulty) => (
			<CategoryPill
				key={difficulty}
				isActive={selected.includes(difficulty)}
				onClick={() => onToggle(difficulty)}
			>
				{EVENT_DIFFICULTY_LABELS[difficulty]}
			</CategoryPill>
		));

	if (variant === 'inline') {
		return (
			<div className="space-y-3">
				<p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
					{translate('event.difficulty')}
				</p>
				<div className="flex flex-wrap gap-2">
					{renderPills(filters.difficulties, (value) =>
						onFiltersChange({ ...filters, difficulties: toggleDifficulty(filters.difficulties, value) }),
					)}
				</div>
			</div>
		);
	}

	return (
		<Popover open={isOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<FilterTriggerButton isActive={isApplied}>
					<Mountain className="text-primary/80 size-4" />
					{label}
				</FilterTriggerButton>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="text-foreground w-72 rounded-3xl p-4 shadow-lg dark:text-white"
			>
				<p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
					{translate('event.difficulty')}
				</p>
				<div className="mt-3 flex flex-wrap gap-2">
					{renderPills(draftDifficulties, (value) =>
						setDraftDifficulties((current) => toggleDifficulty(current, value)),
					)}
				</div>
				<FilterPopoverActions onApply={handleApply} onReset={isApplied ? handleReset : undefined} />
			</PopoverContent>
		</Popover>
	);
}
