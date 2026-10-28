import { ReviewService } from './review.service';

function build(existing: unknown) {
	const calls: { reviewDelete: unknown[]; eventUpdate: unknown[] } = {
		reviewDelete: [],
		eventUpdate: [],
	};
	const tx = {
		review: { delete: (args: unknown) => Promise.resolve(calls.reviewDelete.push(args)) },
		event: { update: (args: unknown) => Promise.resolve(calls.eventUpdate.push(args)) },
	};
	const prisma = {
		review: { findUnique: () => Promise.resolve(existing) },
		$transaction: (run: (client: typeof tx) => Promise<void>) => run(tx),
	};

	return { service: new ReviewService(prisma as never, {} as never, {} as never), calls };
}

const published = { id: 'r1', userId: 'u1', eventId: 'e1', status: 'PUBLISHED', rating: 4 };

describe('ReviewService.deleteForBooking', () => {
	it('removes the review and takes its rating out of the event', async () => {
		const { service, calls } = build(published);

		await service.deleteForBooking('u1', 'b1');

		expect(calls.reviewDelete).toEqual([{ where: { id: 'r1' } }]);
		expect(calls.eventUpdate).toEqual([
			{
				where: { id: 'e1' },
				data: { ratingSum: { increment: -4 }, ratingCount: { increment: -1 } },
			},
		]);
	});

	it('leaves the rating alone when the review was never published', async () => {
		const { service, calls } = build({ ...published, status: 'PENDING' });

		await service.deleteForBooking('u1', 'b1');

		expect(calls.reviewDelete).toHaveLength(1);
		expect(calls.eventUpdate).toHaveLength(0);
	});

	it("refuses to delete somebody else's review", async () => {
		const { service, calls } = build(published);

		await expect(service.deleteForBooking('u2', 'b1')).rejects.toBeDefined();
		expect(calls.reviewDelete).toHaveLength(0);
	});

	it('refuses when there is no review', async () => {
		const { service } = build(null);

		await expect(service.deleteForBooking('u1', 'b1')).rejects.toBeDefined();
	});
});
