import { SearchService } from './search.service';

const translations = (title: string) => [
	{ locale: 'ru', title, location: 'Армения', description: '' },
];

const event = (id: string, title: string) => ({
	id,
	price: 5000,
	translations: translations(title),
	images: [{ url: `https://img/${id}.jpg` }],
	category: { translations: [{ locale: 'ru', name: 'Походы' }] },
	occurrences: [{ date: new Date('2030-01-01T08:00:00Z') }],
});

function build(options: {
	events?: ReturnType<typeof event>[];
	booked?: string[];
	history?: { id: string; query: string; normalized: string }[];
	latest?: { createdAt: Date } | null;
}) {
	const created: unknown[] = [];
	const hidden: unknown[] = [];
	const prisma = {
		event: { findMany: () => Promise.resolve(options.events ?? []) },
		category: {
			findMany: () =>
				Promise.resolve([{ slug: 'hiking', translations: [{ locale: 'ru', name: 'Походы' }] }]),
		},
		booking: {
			findMany: () =>
				Promise.resolve((options.booked ?? []).map((eventId) => ({ occurrence: { eventId } }))),
		},
		searchQuery: {
			findMany: () => Promise.resolve(options.history ?? []),
			findFirst: (args: { where: { id?: string } }) =>
				Promise.resolve(args.where.id ? { normalized: 'гарни' } : (options.latest ?? null)),
			create: (args: unknown) => {
				created.push(args);
				return Promise.resolve({});
			},
			updateMany: (args: unknown) => {
				hidden.push(args);
				return Promise.resolve({ count: 1 });
			},
		},
	};

	return { service: new SearchService(prisma as never), created, hidden };
}

describe('search suggestions', () => {
	it('finds tours by a typed start and puts the one named after it first', async () => {
		const { service } = build({
			events: [event('a', 'Поход к монастырю'), event('b', 'Гарни и Гегард')],
		});
		const result = await service.suggest('гарн');

		expect(result.events.map((item) => item.id)).toEqual(['b']);
		expect(result.events[0]).toMatchObject({ price: 5000, imageUrl: 'https://img/b.jpg' });
	});

	it('suggests a category by its name', async () => {
		const { service } = build({ events: [] });
		const result = await service.suggest('поход');

		expect(result.categories.map((category) => category.slug)).toEqual(['hiking']);
	});

	it('suggests nothing for a query too short to mean anything', async () => {
		const { service } = build({ events: [event('a', 'Гарни')] });

		expect(await service.suggest('г')).toEqual({ events: [], categories: [] });
	});
});

describe('recommended tours', () => {
	const events = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id) => event(id, `Тур ${id}`));

	it('puts the most booked first, then fills the list with others', async () => {
		const { service } = build({ events, booked: ['c', 'c', 'c', 'e', 'e', 'a'] });
		const result = await service.recommended();

		expect(result.map((item) => item.id).slice(0, 3)).toEqual(['c', 'e', 'a']);
		expect(result).toHaveLength(5);
		expect(new Set(result.map((item) => item.id)).size).toBe(5);
	});

	it('falls back to random tours when nothing has been booked', async () => {
		const { service } = build({ events, booked: [] });

		expect(await service.recommended()).toHaveLength(5);
	});

	it('is empty when there is nothing to book', async () => {
		const { service } = build({ events: [] });

		expect(await service.recommended()).toEqual([]);
	});
});

describe('search history', () => {
	it('shows each query once, newest first', async () => {
		const { service } = build({
			history: [
				{ id: '1', query: 'Гарни', normalized: 'гарни' },
				{ id: '2', query: 'гарни', normalized: 'гарни' },
				{ id: '3', query: 'Севан', normalized: 'севан' },
			],
		});

		expect(await service.history('u1')).toEqual([
			{ id: '1', query: 'Гарни' },
			{ id: '3', query: 'Севан' },
		]);
	});

	it('records a query, but not the same one twice within a minute', async () => {
		const fresh = build({ latest: null });
		await fresh.service.record('u1', '  Гарни  ');
		expect(fresh.created).toEqual([{ data: { userId: 'u1', query: 'Гарни', normalized: 'гарни' } }]);

		const repeat = build({ latest: { createdAt: new Date() } });
		await repeat.service.record('u1', 'Гарни');
		expect(repeat.created).toHaveLength(0);
	});

	it('ignores a query that is too short', async () => {
		const { service, created } = build({});
		await service.record('u1', ' г ');

		expect(created).toHaveLength(0);
	});

	it('hides every copy of a query from the visitor without deleting the rows', async () => {
		const { service, hidden } = build({});
		await service.forget('u1', '1');

		expect(hidden).toEqual([
			{ where: { userId: 'u1', normalized: 'гарни' }, data: { hidden: true } },
		]);
	});
});
