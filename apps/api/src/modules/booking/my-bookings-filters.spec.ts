import {
	decodeMyBookingsCursor,
	encodeMyBookingsCursor,
	myBookingsOrder,
	myBookingsPhases,
	myBookingsWhere,
} from './my-bookings-filters';

const BOUNDARY = new Date('2026-10-27T10:00:00.000Z');
const TOUR = new Date('2026-11-02T06:00:00.000Z');
const ID = '550e8400-e29b-41d4-a716-446655440001';

function cursorText(phase: string, boundary: string, date: string, id: string, extra = ''): string {
	return [phase, boundary, date, id].join('|') + extra;
}

describe('my bookings cursor', () => {
	it('survives a round trip', () => {
		const cursor = { phase: 'past' as const, boundary: BOUNDARY, date: TOUR, id: ID };

		expect(decodeMyBookingsCursor(encodeMyBookingsCursor(cursor))).toEqual(cursor);
	});

	it('treats junk as no cursor, so the list restarts instead of failing', () => {
		const boundary = BOUNDARY.toISOString();
		const date = TOUR.toISOString();

		expect(decodeMyBookingsCursor(undefined)).toBeNull();
		expect(decodeMyBookingsCursor('nonsense')).toBeNull();
		expect(decodeMyBookingsCursor(cursorText('soon', boundary, date, ID))).toBeNull();
		expect(decodeMyBookingsCursor(cursorText('past', 'bad', date, ID))).toBeNull();
		expect(decodeMyBookingsCursor(cursorText('past', boundary, date, ID, '|x'))).toBeNull();
	});
});

describe('myBookingsPhases', () => {
	it('opens with tours ahead and continues into the past', () => {
		expect(myBookingsPhases()).toEqual(['upcoming', 'past']);
		expect(myBookingsPhases('CONFIRMED')).toEqual(['upcoming', 'past']);
		expect(myBookingsPhases('PENDING')).toEqual(['upcoming', 'past']);
	});

	it('keeps attended and cancelled bookings as history only', () => {
		expect(myBookingsPhases('CHECKED_IN')).toEqual(['past']);
		expect(myBookingsPhases('CANCELLED')).toEqual(['past']);
	});
});

describe('myBookingsOrder', () => {
	it('puts the nearest tour first ahead, the latest first behind', () => {
		expect(myBookingsOrder('upcoming')).toEqual([{ occurrence: { date: 'asc' } }, { id: 'asc' }]);
		expect(myBookingsOrder('past')).toEqual([{ occurrence: { date: 'desc' } }, { id: 'desc' }]);
	});
});

describe('myBookingsWhere', () => {
	it('never leaves out the owner', () => {
		expect(myBookingsWhere({ userId: 'u1' }).userId).toBe('u1');
	});

	it('splits tours at the boundary, each on its own side', () => {
		const ahead = myBookingsWhere({ userId: 'u1', phase: 'upcoming', boundary: BOUNDARY });
		const behind = myBookingsWhere({ userId: 'u1', phase: 'past', boundary: BOUNDARY });

		expect(ahead.occurrence).toEqual({ date: { gt: BOUNDARY } });
		expect(behind.occurrence).toEqual({ date: { lte: BOUNDARY } });
	});

	it('does not cut history at the boundary', () => {
		const where = myBookingsWhere({
			userId: 'u1',
			status: 'CANCELLED',
			phase: 'past',
			boundary: BOUNDARY,
		});

		expect(where.occurrence).toBeUndefined();
	});

	it('walks past the last row, tie-breaking by id on the same tour date', () => {
		const ahead = myBookingsWhere({
			userId: 'u1',
			phase: 'upcoming',
			boundary: BOUNDARY,
			after: { phase: 'upcoming', boundary: BOUNDARY, date: TOUR, id: ID },
		});
		const behind = myBookingsWhere({
			userId: 'u1',
			phase: 'past',
			boundary: BOUNDARY,
			after: { phase: 'past', boundary: BOUNDARY, date: TOUR, id: ID },
		});

		expect(ahead.AND).toEqual([
			{
				OR: [{ occurrence: { date: { gt: TOUR } } }, { occurrence: { date: TOUR }, id: { gt: ID } }],
			},
		]);
		expect(behind.AND).toEqual([
			{
				OR: [{ occurrence: { date: { lt: TOUR } } }, { occurrence: { date: TOUR }, id: { lt: ID } }],
			},
		]);
	});

	it('spells a display status out in columns', () => {
		expect(myBookingsWhere({ userId: 'u1', status: 'CONFIRMED' })).toMatchObject({
			status: 'CONFIRMED',
			checkedInAt: null,
		});
		expect(myBookingsWhere({ userId: 'u1', status: 'CHECKED_IN' })).toMatchObject({
			status: 'CONFIRMED',
			checkedInAt: { not: null },
		});
	});
});
