import { normalizeSourceRef, sourceConversion } from '@event-space/shared';
import { addVisits, NONE_KEY, sourceKey, totalsBySource, type SourceBookingRow } from './source-totals';
import { buildBookingsWhere } from '../bookings/booking-filters';

const NOW = new Date('2026-11-20T12:00:00Z');
const PAST_TOUR = { date: new Date('2026-11-10T08:00:00Z'), event: { duration: 240 } };
const FUTURE_TOUR = { date: new Date('2026-12-10T08:00:00Z'), event: { duration: 240 } };

function row(overrides: Partial<SourceBookingRow>): SourceBookingRow {
	return {
		sourceId: null,
		sourceRef: null,
		createdByAdminId: null,
		status: 'CONFIRMED',
		paymentMethod: 'SITE_PAYMENT',
		amount: 10000,
		quantity: 2,
		checkedInAt: null,
		adjustments: [],
		occurrence: PAST_TOUR,
		...overrides,
	};
}

const charge = (amount: number, feeAmount: number | null = null) => ({
	type: 'CHARGE',
	amount,
	feeAmount,
	createdAt: new Date('2026-11-01T00:00:00Z'),
});

describe('normalizeSourceRef', () => {
	it('lowercases and trims a readable label', () => {
		expect(normalizeSourceRef('  Ardvi-Hotel_2 ')).toBe('ardvi-hotel_2');
	});

	it('drops what cannot be a label', () => {
		expect(normalizeSourceRef('')).toBeNull();
		expect(normalizeSourceRef(null)).toBeNull();
		expect(normalizeSourceRef('two words')).toBeNull();
		expect(normalizeSourceRef('-leading')).toBeNull();
		expect(normalizeSourceRef('отель')).toBeNull();
		expect(normalizeSourceRef('a'.repeat(61))).toBeNull();
	});
});

describe('sourceKey', () => {
	it('groups by source, then by unknown label, then as not specified', () => {
		expect(sourceKey({ sourceId: 's1', sourceRef: 'ardvi' })).toBe('s1');
		expect(sourceKey({ sourceId: null, sourceRef: 'ardvi' })).toBe('ref:ardvi');
		expect(sourceKey({ sourceId: null, sourceRef: null })).toBe(NONE_KEY);
	});
});

describe('totalsBySource', () => {
	it('counts confirmed bookings only, with guests, amount and what was received', () => {
		const totals = totalsBySource(
			[
				row({ sourceId: 's1', adjustments: [charge(10000, 300)] }),
				row({ sourceId: 's1', quantity: 3, amount: 15000, occurrence: FUTURE_TOUR, adjustments: [charge(15000)] }),
				row({ sourceId: 's1', status: 'CANCELLED', adjustments: [charge(10000)] }),
				row({ sourceId: 's1', status: 'PENDING' }),
			],
			NOW,
		);

		expect(totals.get('s1')).toEqual({ visits: 0, siteBookings: 2, bookings: 2, guests: 5, amount: 25000, paid: 24700 });
	});

	it('counts pay-on-arrival as received only once the guest came', () => {
		const totals = totalsBySource(
			[
				row({ paymentMethod: 'PAY_ON_ARRIVAL', checkedInAt: new Date('2026-11-10T08:05:00Z') }),
				row({ paymentMethod: 'PAY_ON_ARRIVAL' }),
				row({ paymentMethod: 'PAY_ON_ARRIVAL', occurrence: FUTURE_TOUR }),
			],
			NOW,
		);

		expect(totals.get(NONE_KEY)).toEqual({ visits: 0, siteBookings: 3, bookings: 3, guests: 6, amount: 30000, paid: 10000 });
	});

	it('keeps unknown labels apart from each other', () => {
		const totals = totalsBySource(
			[row({ sourceRef: 'ardvi' }), row({ sourceRef: 'ani' }), row({ sourceRef: 'ardvi' })],
			NOW,
		);

		expect(totals.get('ref:ardvi')?.bookings).toBe(2);
		expect(totals.get('ref:ani')?.bookings).toBe(1);
	});
});

describe('visits and conversion', () => {
	it('adds visits to sources and to unknown labels, and counts site bookings apart', () => {
		const totals = addVisits(
			totalsBySource(
				[row({ sourceId: 's1' }), row({ sourceId: 's1', createdByAdminId: 'admin' })],
				NOW,
			),
			[
				{ sourceId: 's1', ref: 'ardvi', visits: 40 },
				{ sourceId: null, ref: 'ani', visits: 7 },
			],
		);

		expect(totals.get('s1')).toMatchObject({ visits: 40, siteBookings: 1, bookings: 2 });
		expect(totals.get('ref:ani')).toMatchObject({ visits: 7, bookings: 0 });
	});

	it('reads conversion as site bookings over visits', () => {
		expect(sourceConversion({ visits: 40, siteBookings: 6 })).toBeCloseTo(0.15);
		expect(sourceConversion({ visits: 0, siteBookings: 3 })).toBeNull();
		expect(sourceConversion({ visits: 2, siteBookings: 5 })).toBe(1);
	});
});

describe('booking filter by source', () => {
	it('reads "none", "unknown" and a source id', () => {
		expect(buildBookingsWhere({ source: 'none' }, NOW)).toMatchObject({ sourceId: null, sourceRef: null });
		expect(buildBookingsWhere({ source: 'unknown' }, NOW)).toMatchObject({
			sourceId: null,
			sourceRef: { not: null },
		});
		expect(buildBookingsWhere({ source: 's1' }, NOW)).toMatchObject({ sourceId: 's1' });
		expect(buildBookingsWhere({}, NOW)).not.toHaveProperty('sourceId');
	});
});
