import { Prisma } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { isBot } from './is-bot';

const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0 Safari/537.36';
const VISITOR = '6f1c2a54-2b6e-4a3c-9d4e-1f2a3b4c5d6e';
const TOUR = '6ac44830-fdd8-420b-96fb-1bdbbfbe409d';
const NOW = new Date('2026-11-20T21:30:00Z');

function setup(createMany = jest.fn().mockResolvedValue({ count: 1 }), known = ['ardvi', 'direct']) {
	const created: string[] = [];
	const source = {
		findUnique: jest.fn(({ where }: { where: { code: string } }) =>
			Promise.resolve(known.includes(where.code) ? { id: `id-${where.code}` } : null),
		),
		create: jest.fn(({ data }: { data: { code: string } }) => {
			created.push(data.code);
			return Promise.resolve({ id: `id-${data.code}` });
		}),
	};
	const prisma = { analyticsEvent: { createMany }, source };
	return { service: new AnalyticsService(prisma as never), createMany, created };
}

describe('AnalyticsService.track', () => {
	it('stores a visit once per visitor a day, with the label the visitor came with', async () => {
		const { service, createMany } = setup();

		await expect(
			service.track({ type: 'VISIT', visitorId: VISITOR, ref: 'Ardvi' }, { userAgent: CHROME }, NOW),
		).resolves.toEqual({ recorded: true });

		expect(createMany).toHaveBeenCalledWith({
			data: [
				{
					type: 'VISIT',
					visitorId: VISITOR,
					day: '2026-11-21',
					targetKey: '',
					eventId: null,
					sourceRef: 'ardvi',
				},
			],
			skipDuplicates: true,
		});
	});

	it('keys a visit by its arrival, so every arrival of the day is its own row', async () => {
		const { service, createMany } = setup();
		const first = '0b6f6a1e-8c1d-4b8e-9a51-2a6f0c3d4e5f';
		const second = '7d2e4c90-1f3a-4b6c-8d9e-0a1b2c3d4e5f';

		await service.track({ type: 'VISIT', visitorId: VISITOR, visitId: first }, { userAgent: CHROME }, NOW);
		await service.track({ type: 'VISIT', visitorId: VISITOR, visitId: second }, { userAgent: CHROME }, NOW);

		expect(createMany.mock.calls.map((call) => call[0].data[0].targetKey)).toEqual([first, second]);
		expect(createMany.mock.calls[0][0].data[0].eventId).toBeNull();
	});

	it('keys a tour view by the tour', async () => {
		const { service, createMany } = setup();

		await service.track({ type: 'TOUR_VIEW', visitorId: VISITOR, eventId: TOUR }, { userAgent: CHROME }, NOW);

		expect(createMany.mock.calls[0][0].data[0]).toMatchObject({
			targetKey: TOUR,
			eventId: TOUR,
			sourceRef: 'direct',
		});
	});

	it('turns a platform alias into the platform and adds an unseen partner label as a new source', async () => {
		const { service, createMany, created } = setup(undefined, ['instagram', 'direct']);

		await service.track({ type: 'VISIT', visitorId: VISITOR, ref: 'ig' }, { userAgent: CHROME }, NOW);
		await service.track({ type: 'VISIT', visitorId: VISITOR, ref: 'hotel-ani' }, { userAgent: CHROME }, NOW);

		expect(createMany.mock.calls[0][0].data[0].sourceRef).toBe('instagram');
		expect(createMany.mock.calls[1][0].data[0].sourceRef).toBe('hotel-ani');
		expect(created).toEqual(['hotel-ani']);
	});

	it('reports a repeat of the same day as not recorded', async () => {
		const { service } = setup(jest.fn().mockResolvedValue({ count: 0 }));

		await expect(service.track({ type: 'VISIT', visitorId: VISITOR }, { userAgent: CHROME }, NOW)).resolves.toEqual({
			recorded: false,
		});
	});

	it('skips admins and bots', async () => {
		const { service, createMany } = setup();

		await service.track({ type: 'VISIT', visitorId: VISITOR }, { userAgent: CHROME, role: 'ADMIN' }, NOW);
		await service.track({ type: 'VISIT', visitorId: VISITOR }, { userAgent: 'Googlebot/2.1' }, NOW);
		await service.track({ type: 'VISIT', visitorId: VISITOR }, {}, NOW);

		expect(createMany).not.toHaveBeenCalled();
	});

	it('ignores a tour that does not exist', async () => {
		const missing = new Prisma.PrismaClientKnownRequestError('fk', { code: 'P2003', clientVersion: 'test' });
		const { service } = setup(jest.fn().mockRejectedValue(missing));

		await expect(
			service.track({ type: 'TOUR_VIEW', visitorId: VISITOR, eventId: TOUR }, { userAgent: CHROME }, NOW),
		).resolves.toEqual({ recorded: false });
	});
});

describe('isBot', () => {
	it('tells crawlers and link previews from people', () => {
		expect(isBot(CHROME)).toBe(false);
		expect(isBot('facebookexternalhit/1.1')).toBe(true);
		expect(isBot('TelegramBot (like TwitterBot)')).toBe(true);
		expect(isBot(undefined)).toBe(true);
	});
});
