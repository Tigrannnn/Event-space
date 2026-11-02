import { ReviewService } from './review.service';

function build() {
	const wheres: Array<Record<string, unknown>> = [];
	const prisma = {
		review: {
			findMany: (args: { where: Record<string, unknown> }) => {
				wheres.push(args.where);
				return Promise.resolve([]);
			},
		},
		booking: { findMany: () => Promise.resolve([]) },
	};

	return { service: new ReviewService(prisma as never, {} as never, {} as never, {} as never), wheres };
}

describe('ReviewService.findForEvent', () => {
	it('keeps reviews with no author of their own in the list a signed-in visitor sees', async () => {
		const { service, wheres } = build();

		await service.findForEvent('e1', {}, 'u1');

		// `NOT userId = u1` is unknown for a review written on another site, which drops it.
		expect(wheres[0]).toEqual({
			eventId: 'e1',
			status: 'PUBLISHED',
			AND: [{ OR: [{ userId: null }, { userId: { not: 'u1' } }] }],
		});
	});

	it('asks for nothing about authors when nobody is signed in', async () => {
		const { service, wheres } = build();

		await service.findForEvent('e1', {});

		expect(wheres[0]).toEqual({ eventId: 'e1', status: 'PUBLISHED', AND: [] });
	});
});
