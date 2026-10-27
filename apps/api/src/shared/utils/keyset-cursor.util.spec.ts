import { decodeKeysetCursor, encodeKeysetCursor } from './keyset-cursor.util';

const CREATED_AT = new Date('2026-10-20T09:30:00.000Z');
const ID = '550e8400-e29b-41d4-a716-446655440001';

describe('keyset cursor', () => {
	it('survives a round trip', () => {
		expect(decodeKeysetCursor(encodeKeysetCursor({ createdAt: CREATED_AT, id: ID }))).toEqual({
			createdAt: CREATED_AT,
			id: ID,
		});
	});

	it('treats junk as no cursor, so the list restarts instead of failing', () => {
		expect(decodeKeysetCursor('')).toBeNull();
		expect(decodeKeysetCursor('nonsense')).toBeNull();
		expect(decodeKeysetCursor('_' + ID)).toBeNull();
		expect(decodeKeysetCursor('not-a-date_' + ID)).toBeNull();
	});
});
