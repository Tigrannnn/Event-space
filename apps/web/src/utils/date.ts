/**
 * Date formatting utilities
 */

import { LocaleIntlEnum } from '@event-space/shared';

const getValidDate = (date: string | Date | null | undefined): Date | null => {
	if (!date) return null;

	const parsedDate = typeof date === 'string' ? new Date(date) : date;
	return parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;
};

/**
 * Month names `Intl.DateTimeFormat` cannot be trusted to agree on across environments.
 *
 * A month name isn't just a translation — Russian and Armenian both inflect it when it follows a
 * day number ("15 августа", genitive, not the nominative "август"), so `Intl` earns its keep for
 * the grammar. What it does not reliably do is agree with itself: the same `{month:'short'}`
 * call for `hy-AM` produced "օգս" in Node and "ԱՎԳ" in one browser's more limited locale data.
 * Since the same code runs once on the server and once in the browser, that disagreement isn't
 * cosmetic — it's a guaranteed hydration mismatch, React comparing the two renders as strings.
 *
 * These twelve-entry tables were read out of Node's own (correct, full-ICU) `Intl` output for
 * `{day:'numeric', month:'short'|'long'}` — the inflected form each locale actually uses next to
 * a day number — and are then used verbatim on both server and client, so there is nothing left
 * for the two environments to disagree about.
 */
const MONTH_NAMES: Record<LocaleIntlEnum, { short: string[]; long: string[] }> = {
	'en-US': {
		short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		long: [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December',
		],
	},
	'ru-RU': {
		short: ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
		long: [
			'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
			'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
		],
	},
	'hy-AM': {
		short: ['հնվ', 'փտվ', 'մրտ', 'ապր', 'մյս', 'հնս', 'հլս', 'օգս', 'սեպ', 'հոկ', 'նոյ', 'դեկ'],
		long: [
			'հունվարի', 'փետրվարի', 'մարտի', 'ապրիլի', 'մայիսի', 'հունիսի',
			'հուլիսի', 'օգոստոսի', 'սեպտեմբերի', 'հոկտեմբերի', 'նոյեմբերի', 'դեկտեմբերի',
		],
	},
};

/**
 * Renders a date via `Intl.DateTimeFormat`, but with the `month` part's text replaced by our own
 * table. Everything else — digit order, punctuation, whether the month leads or trails the day —
 * still comes from Intl: that structure is locale convention, not a glyph lookup, and hasn't shown
 * any sign of disagreeing between environments the way names and symbols do.
 */
function formatWithOwnedMonth(
	date: Date,
	locale: LocaleIntlEnum,
	options: Intl.DateTimeFormatOptions,
	monthForm: 'short' | 'long',
): string {
	const parts = new Intl.DateTimeFormat(locale, options).formatToParts(date);
	const month = MONTH_NAMES[locale][monthForm][date.getMonth()];

	return parts.map((part) => (part.type === 'month' ? month : part.value)).join('');
}

export const formatDateYear = (date: string | Date | null | undefined, locale: LocaleIntlEnum): string => {
	const d = getValidDate(date);
	if (!d) return '';

	return formatWithOwnedMonth(d, locale, { day: 'numeric', month: 'long', year: 'numeric' }, 'long');
};

export const formatDateShort = (date: string | Date | null | undefined, locale: LocaleIntlEnum): string => {
	const d = getValidDate(date);
	if (!d) return '';

	return formatWithOwnedMonth(d, locale, { day: 'numeric', month: 'short' }, 'short');
};

export const formatDateTime = (date: string | Date | null | undefined, locale: LocaleIntlEnum): string => {
	const d = getValidDate(date);
	if (!d) return '';

	// Built as two separate formatters joined by a literal comma, not one combined call — so the
	// join character is ours to control rather than whatever phrasing a locale's own date+time
	// pattern would use ("at", "в", none at all), which is a second axis environments could differ
	// on independently of the month name.
	const datePart = formatWithOwnedMonth(d, locale, { month: 'short', day: 'numeric' }, 'short');
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
 * Uses `Intl.RelativeTimeFormat`, so the wording and pluralisation come from the platform rather
 * than needing a translation key per unit and count — English "1 day"/"2 days", Russian's three
 * plural forms, and so on. That coverage is exactly what a hand-rolled table would have to
 * reimplement, so unlike the month names above, this one is left to Intl; it is used only inside
 * the admin dashboard's activity feed, not on any page a first-time visitor's browser would need
 * to agree with the server about.
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
