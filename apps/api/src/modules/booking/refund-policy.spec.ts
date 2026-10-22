import { resolveRefundPolicy } from './booking.utils';

const TOUR = new Date('2026-12-20T09:00:00.000Z');
const RULES = [
	{ hoursBeforeEvent: 72, refundPercentage: 100 },
	{ hoursBeforeEvent: 24, refundPercentage: 50 },
];

describe('resolveRefundPolicy', () => {
	it('follows the cancellation ladder when nobody moved the date', () => {
		expect(
			resolveRefundPolicy({
				now: new Date('2026-12-18T09:00:00.000Z'),
				occurrenceDate: TOUR,
				rules: RULES,
			}),
		).toEqual({ percentage: 50, withholdStripeFee: true, reason: 'RULES' });
	});

	it('gives everything back, fee included, while the window after a move is open', () => {
		expect(
			resolveRefundPolicy({
				now: new Date('2026-12-18T09:00:00.000Z'),
				occurrenceDate: TOUR,
				rules: RULES,
				rescheduleRefundUntil: new Date('2026-12-19T09:00:00.000Z'),
			}),
		).toEqual({ percentage: 100, withholdStripeFee: false, reason: 'RESCHEDULE' });
	});

	it('falls back to the ladder once the window has passed', () => {
		expect(
			resolveRefundPolicy({
				now: new Date('2026-12-18T09:00:00.000Z'),
				occurrenceDate: TOUR,
				rules: RULES,
				rescheduleRefundUntil: new Date('2026-12-17T09:00:00.000Z'),
			}),
		).toEqual({ percentage: 50, withholdStripeFee: true, reason: 'RULES' });
	});

	it('keeps the right after the client said the date suits them', () => {
		// Acceptance only takes the question off the card; changing your mind inside the window
		// is ordinary, and the move still was not the client's doing.
		expect(
			resolveRefundPolicy({
				now: new Date('2026-12-18T09:00:00.000Z'),
				occurrenceDate: TOUR,
				rules: RULES,
				rescheduleRefundUntil: new Date('2026-12-19T09:00:00.000Z'),
			}).reason,
		).toBe('RESCHEDULE');
	});

	it('still covers the last moment of the window', () => {
		const edge = new Date('2026-12-18T09:00:00.000Z');
		expect(
			resolveRefundPolicy({
				now: edge,
				occurrenceDate: TOUR,
				rules: RULES,
				rescheduleRefundUntil: edge,
			}).reason,
		).toBe('RESCHEDULE');
	});
});
