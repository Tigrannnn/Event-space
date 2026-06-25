/**
 * Date formatting utilities
 */

import { LocaleIntlEnum } from "@event-space/shared";

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

export const formatDateTime = (date: string | Date, locale: LocaleIntlEnum): string => {
	const d = typeof date === 'string' ? new Date(date) : date;

	// Build a deterministic string using separate formatters to avoid
	// server/client locale differences (commas vs "at" etc.).
	const datePart = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(d);
	const timePart = new Intl.DateTimeFormat(locale, {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
		hourCycle: 'h12',
	}).format(d);

	return `${datePart}, ${timePart}`;
};

export const formatTime = (date: string | Date, locale = 'en-US'): string => {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleTimeString(locale, {
		hour: '2-digit',
		minute: '2-digit',
	});
};
