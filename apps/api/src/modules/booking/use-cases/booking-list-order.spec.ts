import { createBookingService } from '../testing/booking.test-helpers';

const HOUR = 60 * 60 * 1000;
const NOW = Date.now();

interface Where {
	occurrence?: { date?: { gt?: Date; lte?: Date } };
	AND?: { OR: Clause[] }[];
}
type Clause = {
	occurrence: { date: Date | { gt?: Date; lt?: Date } };
	id?: { gt?: string; lt?: string };
};

function stored(id: string, hoursFromNow: number) {
	return {
		id,
		userId: 'u1',
		occurrenceId: `o-${id}`,
		status: 'CONFIRMED',
		quantity: 1,
		amount: 0,
		paymentIntentId: null,
		createdAt: new Date(NOW),
		adjustments: [],
		occurrence: {
			id: `o-${id}`,
			date: new Date(NOW + hoursFromNow * HOUR),
			event: {
				id: 'e1',
				price: 0,
				images: [],
				cancellationRules: [],
				translations: [],
				category: { translations: [] },
				occurrences: [],
			},
		},
		user: { id: 'u1' },
	};
}

function build(rows: ReturnType<typeof stored>[]) {
	const after = (row: ReturnType<typeof stored>, clause: Clause) => {
		const at = row.occurrence.date.getTime();
		const date = clause.occurrence.date;

		if (date instanceof Date) {
			const [op, value] = Object.entries(clause.id ?? {})[0];
			return at === date.getTime() && (op === 'gt' ? row.id > value : row.id < value);
		}

		const [op, value] = Object.entries(date)[0];
		return op === 'gt' ? at > value.getTime() : at < value.getTime();
	};

	const prisma = {
		booking: {
			findMany: ({
				where,
				take,
				orderBy,
			}: {
				where: Where;
				take: number;
				orderBy: { occurrence: { date: 'asc' | 'desc' } }[];
			}) => {
				const range = where.occurrence?.date;
				const found = rows
					.filter((row) => {
						const at = row.occurrence.date.getTime();
						if (range?.gt && at <= range.gt.getTime()) return false;
						if (range?.lte && at > range.lte.getTime()) return false;
						return (where.AND ?? []).every((group) => group.OR.some((c) => after(row, c)));
					})
					.sort((a, b) => a.occurrence.date.getTime() - b.occurrence.date.getTime());

				if (orderBy[0].occurrence.date === 'desc') found.reverse();
				return Promise.resolve(found.slice(0, take));
			},
		},
	};

	return createBookingService(prisma as never, {} as never, {} as never);
}

describe('order of a client’s bookings', () => {
	const rows = [
		stored('past-10', -10),
		stored('ahead-48', 48),
		stored('past-48', -48),
		stored('ahead-24', 24),
		stored('past-24', -24),
		stored('ahead-72', 72),
	];

	it('lists tours ahead nearest first, then the past latest first, across pages', async () => {
		const service = build(rows);

		const first = await service.findByUser('u1', { limit: 4 });
		const second = await service.findByUser('u1', { limit: 4, cursor: first.nextCursor ?? '' });

		expect(first.data.map((booking) => booking.id)).toEqual([
			'ahead-24',
			'ahead-48',
			'ahead-72',
			'past-10',
		]);
		expect(first.hasMore).toBe(true);
		expect(second.data.map((booking) => booking.id)).toEqual(['past-24', 'past-48']);
		expect(second.hasMore).toBe(false);
		expect(second.nextCursor).toBeNull();
	});

	it('does not repeat or lose a booking when a page ends exactly between the two groups', async () => {
		const service = build(rows);

		const first = await service.findByUser('u1', { limit: 3 });
		const second = await service.findByUser('u1', { limit: 3, cursor: first.nextCursor ?? '' });

		expect(first.data.map((booking) => booking.id)).toEqual(['ahead-24', 'ahead-48', 'ahead-72']);
		expect(second.data.map((booking) => booking.id)).toEqual(['past-10', 'past-24', 'past-48']);
		expect(second.hasMore).toBe(false);
	});

	it('lists attended and cancelled bookings newest tour first, with no split at the boundary', async () => {
		const service = build(rows);

		const page = await service.findByUser('u1', { limit: 10, status: 'CANCELLED' });

		expect(page.data.map((booking) => booking.id)).toEqual([
			'ahead-72',
			'ahead-48',
			'ahead-24',
			'past-10',
			'past-24',
			'past-48',
		]);
	});
});
