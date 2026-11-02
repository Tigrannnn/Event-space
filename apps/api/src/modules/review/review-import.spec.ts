import { ReviewAdminService } from './review-admin.service';

function build(eventExists = true, channel: { isActive?: boolean; forReviews?: boolean } | null = {}) {
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
		channel: {
			findUnique: (args: { where: { id: string } }) =>
				Promise.resolve(channel === null ? null : { id: args.where.id, isActive: true, forReviews: true, ...channel }),
		},
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
	channelId: 'gyg',
	reviewedAt: new Date('2026-08-01T10:00:00Z'),
};

describe('ReviewAdminService.createImported', () => {
	it('publishes at once, under the name and channel given, and counts toward the rating', async () => {
		const { service, calls } = build();

		await service.createImported('admin1', data);

		expect(calls.create[0].data).toMatchObject({
			eventId: 'e1',
			channelId: 'gyg',
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

	it('refuses a channel that does not exist, is archived, or is not for reviews', async () => {
		for (const channel of [null, { isActive: false }, { forReviews: false }]) {
			const { service, calls } = build(true, channel);

			await expect(service.createImported('admin1', data)).rejects.toBeDefined();
			expect(calls.create).toEqual([]);
		}
	});

	it('refuses a tour that does not exist', async () => {
		const { service, calls } = build(false);

		await expect(service.createImported('admin1', data)).rejects.toBeDefined();
		expect(calls.create).toEqual([]);
	});
});
