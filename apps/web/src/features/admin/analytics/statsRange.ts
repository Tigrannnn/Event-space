import { subDays } from 'date-fns';
import { toZonedDateKey } from '@event-space/shared';
import { formatDateParam } from '@/components/filters';

export interface StatsRange {
	from: string;
	to: string;
}

export const STATS_ALL_TIME_FROM = '2024-01-01';

function today(): Date {
	const [year, month, day] = toZonedDateKey(new Date()).split('-').map(Number);
	return new Date(year, month - 1, day);
}

export function lastDaysRange(days: number): StatsRange {
	return { from: formatDateParam(subDays(today(), days - 1)), to: formatDateParam(today()) };
}

export function allTimeRange(): StatsRange {
	return { from: STATS_ALL_TIME_FROM, to: formatDateParam(today()) };
}
