import { BOOKING_CANCELLED_STRINGS } from './mail-strings';

describe('cancellation email when the fee covers the refund', () => {
	it.each(['en', 'ru', 'hy'] as const)('names both amounts in %s', (locale) => {
		const line = BOOKING_CANCELLED_STRINGS[locale].refundCoveredByFee('500 AMD', '900 AMD');

		expect(line).toContain('500 AMD');
		expect(line).toContain('900 AMD');
	});

	it('does not claim the tour has no refund policy', () => {
		const line = BOOKING_CANCELLED_STRINGS.ru.refundCoveredByFee('500 AMD', '900 AMD');

		expect(line).not.toBe(BOOKING_CANCELLED_STRINGS.ru.noRefund);
		expect(line).toContain('полагался');
	});
});
