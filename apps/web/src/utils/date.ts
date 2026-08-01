/**
 * Date formatting utilities
 */

import { LocaleIntlEnum } from "@event-space/shared";

const getValidDate = (date: string | Date | null | undefined): Date | null => {
	if (!date) return null;

	const parsedDate = typeof date === 'string' ? new Date(date) : date;
	return parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;
};

export const formatDateYear = (date: string | Date | null | undefined, locale = 'en-US'): string => {
	const d = getValidDate(date);
	if (!d) return '';

	return d.toLocaleDateString(locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
};

export const formatDateShort = (date: string | Date | null | undefined, locale = 'en-US'): string => {
	const d = getValidDate(date);
	if (!d) return '';

	return d.toLocaleDateString(locale, {
		day: 'numeric',
		month: 'short',
	});
};

export const formatDateTime = (date: string | Date | null | undefined, locale: LocaleIntlEnum): string => {
	const d = getValidDate(date);
	if (!d) return '';

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

export const formatTime = (date: string | Date | null | undefined, locale = 'en-US'): string => {
	const d = getValidDate(date);
	if (!d) return '';

	return d.toLocaleTimeString(locale, {
		hour: '2-digit',
		minute: '2-digit',
	});
};
