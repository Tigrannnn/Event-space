import { formatMailDate, formatMailDay, formatMailTime, formatMailZoneLabel } from './mail-strings';

describe('times in emails', () => {
	const sevenInYerevan = new Date('2026-09-26T03:00:00Z');

	it('shows a tour at 07:00 Yerevan as 07:00, whatever zone the server runs in', () => {
		expect(formatMailTime(sevenInYerevan, 'ru')).toBe('07:00');
		expect(formatMailTime(sevenInYerevan, 'en')).toBe('07:00');
	});

	it('names the zone next to a date with a time', () => {
		expect(formatMailDate(sevenInYerevan, 'en')).toContain('07:00');
		expect(formatMailDate(sevenInYerevan, 'en')).toContain('Yerevan time (GMT+4)');
		expect(formatMailDate(sevenInYerevan, 'ru')).toContain('по времени Еревана (GMT+4)');
		expect(formatMailZoneLabel(sevenInYerevan, 'hy')).toBe('Երևանի ժամանակով (GMT+4)');
	});

	it('puts a late-evening Yerevan departure on its own day, not on the UTC day', () => {
		const lateEvening = new Date('2026-09-26T21:30:00Z');

		expect(formatMailDay(lateEvening, 'en')).toBe('September 27, 2026');
	});
});
