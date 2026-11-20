import type { TourFunnelRow } from '@event-space/shared';

export function tourTitle(row: Pick<TourFunnelRow, 'titles'>, locale: string): string {
	return (
		row.titles.find((item) => item.locale === locale)?.title ||
		row.titles.find((item) => item.locale === 'en')?.title ||
		row.titles[0]?.title ||
		'—'
	);
}

export function percent(part: number, whole: number): string {
	if (whole <= 0) return '—';
	return `${Math.round(Math.min(1, part / whole) * 100)}%`;
}
