import { ReviewAdminService } from './review-admin.service';

function build(eventExists = true) {
	const calls: { create: Array<{ data: Record<string, unknown> }>; eventUpdate: unknown[] } = {
		create: [],
		eventUpdate: [],
	};
	const tx = {
		review: {
			create: (args: { data: Record<string, unknown> }) => {
				calls.create.push(args);
				return Promise.resolve({ ...args.data, id: 'r1', status: args.data.status, rating: args.data.rating });
			},
		},
		event: { update: (args: unknown) => Promise.resolve(calls.eventUpdate.push(args)) },
	};
	const prisma = {
		event: { findUnique: () => Promise.resolve(eventExists ? { id: 'e1' } : null) },
		$transaction: (run: (client: typeof tx) => Promise<unknown>) => run(tx),
	};

	return { service: new ReviewAdminService(
			prisma as never,
			{} as never,
			{} as never,
			{ uploadImages: () => Promise.resolve([]), deleteMultipleByPublicId: () => Promise.resolve() } as never,
		), calls };
}

const data = {
	eventId: 'e1',
	authorName: '  Anna  ',
	rating: 5,
	text: ' Great ',
	source: 'GETYOURGUIDE' as const,
	reviewedAt: new Date('2026-08-01T10:00:00Z'),
};

describe('ReviewAdminService.createImported', () => {
	it('publishes at once, under the name and source given, and counts toward the rating', async () => {
		const { service, calls } = build();

		await service.createImported('admin1', data);

		expect(calls.create[0].data).toMatchObject({
			eventId: 'e1',
			source: 'GETYOURGUIDE',
			authorName: 'Anna',
			text: 'Great',
			status: 'PUBLISHED',
			moderatedByAdminId: 'admin1',
			createdAt: data.reviewedAt,
		});
		expect(calls.eventUpdate).toEqual([
			{
				where: { id: 'e1' },
				data: { ratingSum: { increment: 5 }, ratingCount: { increment: 1 } },
			},
		]);
	});

	it('keeps the name of a site that is not on the list, and drops it for one that is', async () => {
		const { service, calls } = build();

		await service.createImported('admin1', { ...data, source: 'OTHER', sourceName: ' Yelp ' });
		await service.createImported('admin1', { ...data, sourceName: 'Yelp' });

		expect(calls.create[0].data).toMatchObject({ source: 'OTHER', sourceName: 'Yelp' });
		expect(calls.create[1].data).toMatchObject({ source: 'GETYOURGUIDE', sourceName: null });
	});

	it('refuses a tour that does not exist', async () => {
		const { service, calls } = build(false);

		await expect(service.createImported('admin1', data)).rejects.toBeDefined();
		expect(calls.create).toEqual([]);
	});
});
