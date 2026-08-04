import { startOfToday, subDays } from 'date-fns';
import { formatDateParam } from '@/components/filters';
import { readString, writeParam } from '@/hooks/urlFilters';

export interface DashboardRange {
	from: string;
	to: string;
}

/** Last 30 days — long enough for a trend to be visible, short enough to stay readable. */
export const DEFAULT_RANGE_DAYS = 30;

export function defaultDashboardRange(): DashboardRange {
	const today = startOfToday();
	return {
		from: formatDateParam(subDays(today, DEFAULT_RANGE_DAYS - 1)),
		to: formatDateParam(today),
	};
}

export function parseDashboardRange(params: URLSearchParams): DashboardRange {
	const fallback = defaultDashboardRange();
	const from = readString(params, 'from') ?? fallback.from;
	const to = readString(params, 'to') ?? fallback.to;

	// A reversed range would return nothing at all; swapping is friendlier than an empty page.
	return from <= to ? { from, to } : { from: to, to: from };
}

export function serializeDashboardRange(
	params: URLSearchParams,
	range: DashboardRange,
): URLSearchParams {
	const fallback = defaultDashboardRange();
	const isDefault = range.from === fallback.from && range.to === fallback.to;

	writeParam(params, 'from', isDefault ? undefined : range.from);
	writeParam(params, 'to', isDefault ? undefined : range.to);
	return params;
}

/**
 * Whether the range is just today.
 *
 * Today has no snapshot — it has not finished, and its state is still moving — so the state
 * widget shows live numbers instead of a chart.
 */
export function isTodayOnly(range: DashboardRange): boolean {
	const today = formatDateParam(startOfToday());
	return range.from === today && range.to === today;
}
