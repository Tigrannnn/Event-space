import {
	APP_TIME_ZONE,
	endOfZonedDay,
	formatZoneOffset,
	getZoneOffsetMinutes,
	getZonedMonthIndex,
	startOfZonedDay,
	toZonedDateKey,
	toZonedLocalInput,
	zonedLocalInputToDate,
} from '@event-space/shared';
import { endOfDay, startOfDay, toDateKey } from './app-day.util';

describe('the product time zone', () => {
	it('is Yerevan', () => {
		expect(APP_TIME_ZONE).toBe('Asia/Yerevan');
	});

	it('starts the day at midnight in Yerevan, not at midnight UTC', () => {
		expect(startOfDay('2026-03-10').toISOString()).toBe('2026-03-09T20:00:00.000Z');
		expect(endOfDay('2026-03-10').toISOString()).toBe('2026-03-10T19:59:59.999Z');
	});

	it('keys a late-evening Yerevan time to its own day', () => {
		expect(toDateKey(new Date('2026-03-10T19:30:00Z'))).toBe('2026-03-10');
		expect(toDateKey(new Date('2026-03-10T20:30:00Z'))).toBe('2026-03-11');
	});

	it('keys an early-morning Yerevan time to its own day even though UTC is still the day before', () => {
		expect(toDateKey(new Date('2026-03-09T21:00:00Z'))).toBe('2026-03-10');
	});

	it('reads the month in the zone, not in the machine', () => {
		expect(getZonedMonthIndex(new Date('2026-09-30T21:00:00Z'))).toBe(9);
		expect(getZonedMonthIndex(new Date('2026-09-30T19:00:00Z'))).toBe(8);
	});

	it('labels the offset so every environment prints it the same', () => {
		expect(formatZoneOffset(new Date('2026-07-01T00:00:00Z'))).toBe('GMT+4');
		expect(formatZoneOffset(new Date('2026-07-01T00:00:00Z'), 'UTC')).toBe('GMT');
		expect(formatZoneOffset(new Date('2026-07-01T00:00:00Z'), 'Asia/Kolkata')).toBe('GMT+5:30');
		expect(formatZoneOffset(new Date('2026-01-01T00:00:00Z'), 'America/New_York')).toBe('GMT-5');
	});
});

describe('a zone that observes daylight saving', () => {
	const zone = 'America/New_York';

	it('follows the offset change, which a fixed offset could not', () => {
		expect(getZoneOffsetMinutes(new Date('2026-01-15T12:00:00Z'), zone)).toBe(-300);
		expect(getZoneOffsetMinutes(new Date('2026-07-15T12:00:00Z'), zone)).toBe(-240);
	});

	it('makes the spring-forward day 23 hours long', () => {
		const start = startOfZonedDay('2026-03-08', zone);
		const end = endOfZonedDay('2026-03-08', zone);

		expect(start.toISOString()).toBe('2026-03-08T05:00:00.000Z');
		expect(end.toISOString()).toBe('2026-03-09T03:59:59.999Z');
		expect(end.getTime() - start.getTime() + 1).toBe(23 * 60 * 60 * 1000);
	});

	it('makes the fall-back day 25 hours long', () => {
		const start = startOfZonedDay('2026-11-01', zone);
		const end = endOfZonedDay('2026-11-01', zone);

		expect(end.getTime() - start.getTime() + 1).toBe(25 * 60 * 60 * 1000);
	});

	it('keys moments to the right day on either side of midnight', () => {
		expect(toZonedDateKey(new Date('2026-07-15T03:59:00Z'), zone)).toBe('2026-07-14');
		expect(toZonedDateKey(new Date('2026-07-15T04:00:00Z'), zone)).toBe('2026-07-15');
	});
});

describe('the value of a date-time input', () => {
	it('is read as Yerevan time wherever the admin is', () => {
		expect(zonedLocalInputToDate('2026-09-26T08:00')?.toISOString()).toBe('2026-09-26T04:00:00.000Z');
	});

	it('is written back the same way it was read', () => {
		expect(toZonedLocalInput('2026-09-26T04:00:00.000Z')).toBe('2026-09-26T08:00');
		expect(toZonedLocalInput(zonedLocalInputToDate('2026-12-31T23:30')!)).toBe('2026-12-31T23:30');
	});

	it('crosses midnight correctly', () => {
		expect(toZonedLocalInput('2026-09-30T21:00:00.000Z')).toBe('2026-10-01T01:00');
		expect(zonedLocalInputToDate('2026-10-01T01:00')?.toISOString()).toBe('2026-09-30T21:00:00.000Z');
	});

	it('is read in another zone when asked, including across DST', () => {
		expect(zonedLocalInputToDate('2026-07-15T08:00', 'America/New_York')?.toISOString()).toBe(
			'2026-07-15T12:00:00.000Z',
		);
		expect(zonedLocalInputToDate('2026-01-15T08:00', 'America/New_York')?.toISOString()).toBe(
			'2026-01-15T13:00:00.000Z',
		);
	});

	it('rejects what is not a date-time', () => {
		expect(zonedLocalInputToDate('')).toBeNull();
		expect(zonedLocalInputToDate('26.09.2026 08:00')).toBeNull();
	});
});
