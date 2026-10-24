import { activeBannersWhere } from './banner-filters';

const NOW = new Date('2026-10-24T10:00:00.000Z');

describe('activeBannersWhere', () => {
	it('only lets through banners the admin switched on', () => {
		expect(activeBannersWhere(NOW).status).toBe('ACTIVE');
	});

	it('treats an empty schedule as "no limit", on both ends', () => {
		const [fromClause, toClause] = activeBannersWhere(NOW).AND as [
			{ OR: unknown[] },
			{ OR: unknown[] },
		];

		expect(fromClause.OR).toEqual([{ startsAt: null }, { startsAt: { lte: NOW } }]);
		expect(toClause.OR).toEqual([{ endsAt: null }, { endsAt: { gte: NOW } }]);
	});

	it('hides a banner whose event is unpublished or has no date left to book', () => {
		const [, , targetClause] = activeBannersWhere(NOW).AND as [unknown, unknown, { OR: unknown[] }];

		expect(targetClause.OR).toEqual([
			{ targetType: { in: ['CATEGORY', 'URL'] } },
			{
				event: {
					status: 'PUBLISHED',
					occurrences: { some: { status: 'ACTIVE', date: { gt: NOW } } },
				},
			},
		]);
	});
});
