/**
 * Date formatting utilities
 */

import { LocaleIntlEnum } from "@event-space/shared";

const getValidDate = (date: string | Date | null | undefined): Date | null => {
	if (!date) return null;

	const parsedDate = typeof date === 'string' ? new Date(date) : date;
	return parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;
};

export const formatDateYear = (date: string | Date | null | undefined, locale: LocaleIntlEnum): string => {
	const d = getValidDate(date);
	if (!d) return '';

	return d.toLocaleDateString(locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
};

export const formatDateShort = (date: string | Date | null | undefined, locale: LocaleIntlEnum): string => {
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

const RELATIVE_THRESHOLDS: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
	{ unit: 'year', seconds: 60 * 60 * 24 * 365 },
	{ unit: 'month', seconds: 60 * 60 * 24 * 30 },
	{ unit: 'day', seconds: 60 * 60 * 24 },
	{ unit: 'hour', seconds: 60 * 60 },
	{ unit: 'minute', seconds: 60 },
];

/**
 * "2 hours ago" in the user's language.
 *
 * Uses `Intl.RelativeTimeFormat`, so the wording and pluralisation come from the platform
 * rather than needing a translation key per unit and count.
 */
export const formatRelativeTime = (
	date: string | Date | null | undefined,
	locale: LocaleIntlEnum,
): string => {
	const d = getValidDate(date);
	if (!d) return '';

	const elapsedSeconds = (d.getTime() - Date.now()) / 1000;
	const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

	for (const { unit, seconds } of RELATIVE_THRESHOLDS) {
		if (Math.abs(elapsedSeconds) >= seconds) {
			return formatter.format(Math.round(elapsedSeconds / seconds), unit);
		}
	}

	return formatter.format(Math.round(elapsedSeconds), 'second');
};

export const formatTime = (date: string | Date | null | undefined, locale: LocaleIntlEnum): string => {
	const d = getValidDate(date);
	if (!d) return '';

	return d.toLocaleTimeString(locale, {
		hour: '2-digit',
		minute: '2-digit',
	});
};
