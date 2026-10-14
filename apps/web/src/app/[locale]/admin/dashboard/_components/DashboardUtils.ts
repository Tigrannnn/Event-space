import { formatDateTime } from '@/utils/date';

export function formatDate(value: Date | string) {
	return formatDateTime(value, 'en-US');
}

export function getPercent(value: number, total: number) {
	if (!total) return 0;
	return Math.round((value / total) * 100);
}
