export function formatCurrency(value: number) {
	return new Intl.NumberFormat('en', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 2,
	}).format(value);
}

export function formatDate(value: Date | string) {
	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(value));
}

export function getPercent(value: number, total: number) {
	if (!total) return 0;
	return Math.round((value / total) * 100);
}
