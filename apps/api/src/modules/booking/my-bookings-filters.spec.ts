import { decodeBookingCursor, encodeBookingCursor, myBookingsWhere } from './my-bookings-filters';

const CREATED_AT = new Date('2026-10-20T09:30:00.000Z');
const ID = '550e8400-e29b-41d4-a716-446655440001';

describe('booking cursor', () => {
	it('survives a round trip', () => {
		expect(decodeBookingCursor(encodeBookingCursor({ createdAt: CREATED_AT, id: ID }))).toEqual({
			createdAt: CREATED_AT,
			id: ID,
		});
	});

	it('treats junk as no cursor, so the list restarts instead of failing', () => {
		expect(decodeBookingCursor('')).toBeNull();
		expect(decodeBookingCursor('nonsense')).toBeNull();
		expect(decodeBookingCursor('_' + ID)).toBeNull();
		expect(decodeBookingCursor('not-a-date_' + ID)).toBeNull();
	});
});

describe('myBookingsWhere', () => {
	it('never leaves out the owner', () => {
		expect(myBookingsWhere({ userId: 'u1' }).userId).toBe('u1');
	});

	it('asks for no page bound without a cursor', () => {
		expect(myBookingsWhere({ userId: 'u1' }).OR).toBeUndefined();
	});

	it('walks past the last row sent, tie-breaking by id on equal timestamps', () => {
		const where = myBookingsWhere({
			userId: 'u1',
			cursor: encodeBookingCursor({ createdAt: CREATED_AT, id: ID }),
		});

		expect(where.OR).toEqual([
			{ createdAt: { lt: CREATED_AT } },
			{ createdAt: CREATED_AT, id: { lt: ID } },
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
