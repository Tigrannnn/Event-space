'use client';

import { useTranslation } from '@/hooks/translation';
import { PriceRangePicker } from '@/components/filters';
import type { EventsFiltersState, PriceBounds } from './types';

interface PriceRangeFilterSectionProps {
	filters: EventsFiltersState;
	priceBounds: PriceBounds;
	onFiltersChange: (filters: EventsFiltersState) => void;
	variant?: 'popover' | 'inline';
}

/**
 * The catalogue's price filter — the shared picker wired to this page's filter state.
 *
 * Inline (inside the mobile drawer) deliberately skips the apply button: the drawer has one for
 * every section at once, so changes there write straight through to its draft.
 */
export function PriceRangeFilterSection({
	filters,
	priceBounds,
	onFiltersChange,
	variant = 'popover',
}: PriceRangeFilterSectionProps) {
	const translate = useTranslation();

	return (
		<PriceRangePicker
			value={filters.priceRange}
			onChange={(priceRange) => onFiltersChange({ ...filters, priceRange })}
			bounds={priceBounds}
			placeholder={translate('filters.price')}
			variant={variant}
			withActions
		/>
	);
}
