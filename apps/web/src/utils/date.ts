/**
 * Date formatting utilities
 */

export const formatDateYear = (date: string | Date, locale = 'en-US'): string => {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString(locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
};

export const formatDateShort = (date: string | Date, locale = 'en-US'): string => {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString(locale, {
		day: 'numeric',
		month: 'short',
	});
};

export const formatDateTime = (date: string | Date, locale = 'en-US'): string => {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleString(locale, {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	});
};

export const formatTime = (date: string | Date, locale = 'en-US'): string => {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleTimeString(locale, {
		hour: '2-digit',
		minute: '2-digit',
	});
};
