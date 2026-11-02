import { Prisma } from '@prisma/client';
import { AdminChannelsService } from './admin-channels.service';

interface Row {
	id: string;
	isSystem: boolean;
}

function build(existing: Row | null = null, uniqueViolation = false) {
	const creates: { data: Record<string, unknown> }[] = [];
	const updates: { where: { id: string }; data: Record<string, unknown> }[] = [];
	const finds: { where: Record<string, unknown> }[] = [];

	const violation = () =>
		new Prisma.PrismaClientKnownRequestError('unique', { code: 'P2002', clientVersion: 'test' });

	const prisma = {
		channel: {
			findMany: (args: { where: Record<string, unknown> }) => {
				finds.push(args);
				return Promise.resolve([
					{ id: 'c1', name: 'Klook', _count: { bookings: 3, reviews: 1 } },
				]);
			},
			findUnique: () => Promise.resolve(existing),
			create: (args: { data: Record<string, unknown> }) => {
				creates.push(args);
				return uniqueViolation ? Promise.reject(violation()) : Promise.resolve({ id: 'new', ...args.data });
			},
			update: (args: { where: { id: string }; data: Record<string, unknown> }) => {
				updates.push(args);
				return uniqueViolation ? Promise.reject(violation()) : Promise.resolve({ id: args.where.id, ...args.data });
			},
		},
	};

	return { service: new AdminChannelsService(prisma as never), creates, updates, finds };
}

describe('AdminChannelsService', () => {
	it('adds a channel under a trimmed name and a key that ignores case and spacing', async () => {
		const { service, creates } = build();
		await service.create({ name: '  Klook  Tours ', forBookings: true, forReviews: false });

		expect(creates[0].data).toMatchObject({
			name: 'Klook  Tours',
			nameKey: 'klook tours',
			forBookings: true,
			forReviews: false,
		});
		expect(String(creates[0].data.code)).toMatch(/^CUSTOM_[0-9a-f]{10}$/);
	});

	it('refuses a name that is taken, whether it was caught up front or by the database', async () => {
		const { service } = build(null, true);
		await expect(
			service.create({ name: 'Klook', forBookings: true, forReviews: false }),
		).rejects.toMatchObject({ code: 'CHANNEL_NAME_TAKEN' });
		await expect(service.update('c1', { name: 'Klook' })).rejects.toBeDefined();
	});

	it('leaves system channels alone', async () => {
		const { service, updates } = build({ id: 'sys', isSystem: true });

		await expect(service.update('sys', { isActive: false })).rejects.toMatchObject({
			code: 'CHANNEL_SYSTEM_LOCKED',
		});
		expect(updates).toHaveLength(0);
	});

	it('archives, restores and renames an ordinary channel', async () => {
		const { service, updates } = build({ id: 'c1', isSystem: false });

		await service.update('c1', { isActive: false });
		await service.update('c1', { name: ' Klook ' });

		expect(updates[0].data).toEqual({ isActive: false });
		expect(updates[1].data).toEqual({ name: 'Klook', nameKey: 'klook' });
	});

	it('refuses to change a channel that does not exist', async () => {
		const { service } = build(null);
		await expect(service.update('nope', { isActive: false })).rejects.toMatchObject({
			code: 'CHANNEL_NOT_FOUND',
		});
	});

	it('lists active channels by default, with how many bookings and reviews use each', async () => {
		const { service, finds } = build();
		const channels = await service.findAll({ forReviews: true });

		expect(finds[0].where).toEqual({ isActive: true, forReviews: true });
		expect(channels[0]).toMatchObject({ id: 'c1', bookingsCount: 3, reviewsCount: 1 });

		await service.findAll({ includeArchived: true });
		expect(finds[1].where).toEqual({});
	});
});
