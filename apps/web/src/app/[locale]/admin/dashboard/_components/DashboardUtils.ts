export function formatDate(value: Date | string) {
	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		hourCycle: 'h23',
	}).format(new Date(value));
}

export function getPercent(value: number, total: number) {
	if (!total) return 0;
	return Math.round((value / total) * 100);
}
