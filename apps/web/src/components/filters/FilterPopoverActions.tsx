'use client';

import { Button } from '@/components/ui/primitives/button';
import { useTranslation } from '@/hooks/translation';

interface FilterPopoverActionsProps {
	onApply: () => void;
	/**
	 * Left out while this filter isn't applied yet: there would be nothing to undo, and a reset
	 * that is always on screen reads as "clear the whole search" rather than "clear this one".
	 */
	onReset?: () => void;
}

/**
 * The footer every filter popover ends with.
 *
 * Filters inside a popover stage their changes and commit on apply, so a half-built selection —
 * a date range with only one end picked, a price being typed — never reaches the catalogue and
 * never costs a request. The popover closing is what confirms the change landed.
 *
 * Filters rendered inline (the mobile drawer) deliberately don't use this: the drawer owns one
 * apply button for all of them at once, and a second one per section would be ambiguous.
 */
export function FilterPopoverActions({ onApply, onReset }: FilterPopoverActionsProps) {
	const translate = useTranslation();

	return (
		<div className="mt-4 flex items-center gap-2 border-t border-gray-200/70 pt-3 dark:border-gray-700/60">
			{onReset && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onReset}
					className="text-gray-600 dark:text-gray-300"
				>
					{translate('filters.reset')}
				</Button>
			)}
			<Button type="button" size="sm" onClick={onApply} className="ml-auto min-w-24">
				{translate('filters.apply')}
			</Button>
		</div>
	);
}
