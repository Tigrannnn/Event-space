import { EventService } from './event.service';
import {
	compareEventListKeys,
	decodeEventListCursor,
	encodeEventListCursor,
	firstOccurrenceDate,
} from './event.utils';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date();

function at(days: number): Date {
	return new Date(NOW.getTime() + days * DAY);
}

function occurrence(days: number, status: 'ACTIVE' | 'CANCELLED' = 'ACTIVE') {
	return { date: at(days), status, discountPercent: 0 };
}

function event(id: string, ...occurrences: ReturnType<typeof occurrence>[]) {
	return {
		id,
		price: 10000,
		difficulty: 'EASY',
		occurrences,
		translations: [],
		cancellationRules: [],
		images: [],
		category: { translations: [] },
	};
}

describe('firstOccurrenceDate', () => {
	it('takes the nearest active date, not the first one stored', () => {
		const found = firstOccurrenceDate(
			{ occurrences: [occurrence(9), occurrence(3), occurrence(5)] },
			{},
			NOW,
		);

		expect(found).toEqual(at(3));
	});

	it('skips cancelled dates and dates already gone', () => {
		const found = firstOccurrenceDate(
			{ occurrences: [occurrence(-2), occurrence(1, 'CANCELLED'), occurrence(7)] },
			{},
			NOW,
		);

		expect(found).toEqual(at(7));
	});

	it('looks only inside the date window', () => {
		const window = { from: at(5), to: at(10) };
		const found = firstOccurrenceDate(
			{ occurrences: [occurrence(2), occurrence(6), occurrence(12)] },
			window,
			NOW,
		);

		expect(found).toEqual(at(6));
	});

	it('falls back to a date already gone when the window holds nothing ahead', () => {
		const window = { from: at(-10), to: at(-1) };
		const found = firstOccurrenceDate({ occurrences: [occurrence(-6), occurrence(-3)] }, window, NOW);

		expect(found).toEqual(at(-6));
	});

	it('finds nothing when no date fits', () => {
		expect(firstOccurrenceDate({ occurrences: [occurrence(1, 'CANCELLED')] }, {}, NOW)).toBeNull();
	});
});

describe('event list cursor', () => {
	it('survives a round trip, ids with underscores included', () => {
		const key = { date: at(4), id: 'evt_abc_1' };

		expect(decodeEventListCursor(encodeEventListCursor(key))).toEqual(key);
	});

	it('treats a bare id or junk as no cursor, so the list restarts', () => {
		expect(decodeEventListCursor(undefined)).toBeNull();
		expect(decodeEventListCursor('550e8400-e29b-41d4-a716-446655440001')).toBeNull();
		expect(decodeEventListCursor('bad-date_id')).toBeNull();
	});

	it('orders by date, then by id', () => {
		expect(compareEventListKeys({ date: at(1), id: 'b' }, { date: at(2), id: 'a' })).toBeLessThan(0);
		expect(compareEventListKeys({ date: at(1), id: 'a' }, { date: at(1), id: 'b' })).toBeLessThan(0);
		expect(compareEventListKeys({ date: at(1), id: 'a' }, { date: at(1), id: 'a' })).toBe(0);
	});
});

describe('EventService.findAll order', () => {
	function build(events: ReturnType<typeof event>[]) {
		const prisma = { event: { findMany: () => Promise.resolve(events) } };

		return new EventService(
			prisma as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
		);
	}

	const events = [
		event('e1', occurrence(20)),
		event('e2', occurrence(30), occurrence(2)),
		event('e3', occurrence(9)),
		event('e4', occurrence(-5), occurrence(15)),
		event('e5', occurrence(9)),
	];

	it('lists events by their nearest date, ties by id', async () => {
		const page = await build(events).findAll(undefined, undefined, 10);

		expect(page.data.map((item) => item.id)).toEqual(['e2', 'e3', 'e5', 'e4', 'e1']);
		expect(page.hasMore).toBe(false);
		expect(page.nextCursor).toBeNull();
	});

	it('pages through the order without repeating or losing an event', async () => {
		const service = build(events);

		const first = await service.findAll(undefined, undefined, 2);
		const second = await service.findAll(undefined, first.nextCursor ?? undefined, 2);
		const third = await service.findAll(undefined, second.nextCursor ?? undefined, 2);

		expect(first.data.map((item) => item.id)).toEqual(['e2', 'e3']);
		expect(second.data.map((item) => item.id)).toEqual(['e5', 'e4']);
		expect(third.data.map((item) => item.id)).toEqual(['e1']);
		expect([first.hasMore, second.hasMore, third.hasMore]).toEqual([true, true, false]);
	});

	it('restarts from the top on a cursor of the old shape', async () => {
		const page = await build(events).findAll(undefined, 'e3', 2);

		expect(page.data.map((item) => item.id)).toEqual(['e2', 'e3']);
	});
});
