import { APP_TIME_ZONE } from '../constants/time.constant';

const FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
	let formatter = FORMATTERS.get(timeZone);

	if (!formatter) {
		formatter = new Intl.DateTimeFormat('en-US', {
			timeZone,
			hourCycle: 'h23',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});
		FORMATTERS.set(timeZone, formatter);
	}

	return formatter;
}

function wallClock(at: Date, timeZone: string) {
	const parts = formatterFor(timeZone).formatToParts(at);
	const read = (type: Intl.DateTimeFormatPartTypes) =>
		Number(parts.find((part) => part.type === type)?.value);

	return {
		year: read('year'),
		month: read('month'),
		day: read('day'),
		hour: read('hour'),
		minute: read('minute'),
		second: read('second'),
	};
}

export function getZoneOffsetMinutes(at: Date, timeZone: string = APP_TIME_ZONE): number {
	const clock = wallClock(at, timeZone);
	const asUtc = Date.UTC(
		clock.year,
		clock.month - 1,
		clock.day,
		clock.hour,
		clock.minute,
		clock.second,
	);
	const truncated = Math.floor(at.getTime() / 1000) * 1000;

	return Math.round((asUtc - truncated) / 60_000);
}

function zonedTimeToUtc(
	date: string,
	time: { hour: number; minute: number; second: number; ms: number },
	timeZone: string,
): Date {
	const [year, month, day] = date.split('-').map(Number);
	const guess = Date.UTC(year, month - 1, day, time.hour, time.minute, time.second, time.ms);
	const firstOffset = getZoneOffsetMinutes(new Date(guess), timeZone);
	const candidate = guess - firstOffset * 60_000;
	const secondOffset = getZoneOffsetMinutes(new Date(candidate), timeZone);

	return new Date(secondOffset === firstOffset ? candidate : guess - secondOffset * 60_000);
}

export function startOfZonedDay(date: string, timeZone: string = APP_TIME_ZONE): Date {
	return zonedTimeToUtc(date, { hour: 0, minute: 0, second: 0, ms: 0 }, timeZone);
}

export function endOfZonedDay(date: string, timeZone: string = APP_TIME_ZONE): Date {
	return zonedTimeToUtc(date, { hour: 23, minute: 59, second: 59, ms: 999 }, timeZone);
}

export function toZonedDateKey(value: Date, timeZone: string = APP_TIME_ZONE): string {
	const clock = wallClock(value, timeZone);
	const pad = (number: number) => String(number).padStart(2, '0');

	return `${clock.year}-${pad(clock.month)}-${pad(clock.day)}`;
}

export function getZonedMonthIndex(value: Date, timeZone: string = APP_TIME_ZONE): number {
	return wallClock(value, timeZone).month - 1;
}

export function formatZoneOffset(at: Date, timeZone: string = APP_TIME_ZONE): string {
	const total = getZoneOffsetMinutes(at, timeZone);
	if (total === 0) return 'GMT';

	const sign = total > 0 ? '+' : '-';
	const hours = Math.floor(Math.abs(total) / 60);
	const minutes = Math.abs(total) % 60;

	return `GMT${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`;
}

export function toZonedLocalInput(value: string | Date, timeZone: string = APP_TIME_ZONE): string {
	const date = new Date(value);
	const clock = wallClock(date, timeZone);
	const pad = (number: number) => String(number).padStart(2, '0');

	return `${clock.year}-${pad(clock.month)}-${pad(clock.day)}T${pad(clock.hour)}:${pad(clock.minute)}`;
}

export function zonedLocalInputToDate(
	value: string,
	timeZone: string = APP_TIME_ZONE,
): Date | null {
	const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(value);
	if (!match) return null;

	return zonedTimeToUtc(
		match[1],
		{ hour: Number(match[2]), minute: Number(match[3]), second: 0, ms: 0 },
		timeZone,
	);
}
