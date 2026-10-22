import { OccurrenceService } from './occurrence.service';

const MOVED_TO = new Date('2026-12-20T09:00:00.000Z');
const BOOKED_FOR = new Date('2026-12-10T09:00:00.000Z');

interface WorldOptions {
	status?: 'ACTIVE' | 'CANCELLED';
	takenBy?: string | null;
	movedUnderUs?: boolean;
}

function build(options: WorldOptions = {}) {
	const { status = 'ACTIVE', takenBy = null, movedUnderUs = false } = options;

	const row = {
		id: 'o1',
		eventId: 'e1',
		date: BOOKED_FOR,
		status,
		previousDate: null as Date | null,
		rescheduledAt: null as Date | null,
	};

	const occurrenceUpdates: Record<string, unknown>[] = [];
	const bookingUpdates: Record<string, unknown>[] = [];

	const eventOccurrence = {
		findUnique: () => Promise.resolve(row),
		findFirst: () => Promise.resolve(takenBy ? { id: takenBy } : null),
		findUniqueOrThrow: () => Promise.resolve(row),
		updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
			if (movedUnderUs) return Promise.resolve({ count: 0 });
			occurrenceUpdates.push(args.data);
			Object.assign(row, args.data);
			return Promise.resolve({ count: 1 });
		},
	};

	const booking = {
		updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
			bookingUpdates.push({ ...args.where, ...args.data });
			return Promise.resolve({ count: 2 });
		},
	};

	const prisma = {
		eventOccurrence,
		booking,
		$transaction: (run: (tx: unknown) => Promise<unknown>) => run({ eventOccurrence, booking }),
	};

	const service = new OccurrenceService(prisma as never, {} as never, {} as never);

	return { service, row, occurrenceUpdates, bookingUpdates };
}

describe('OccurrenceService.reschedule', () => {
	it('moves the date, remembers the old one and lets the reminder go out again', async () => {
		const { service, occurrenceUpdates, bookingUpdates } = build();

		await service.reschedule('o1', { date: MOVED_TO });

		expect(occurrenceUpdates).toHaveLength(1);
		expect(occurrenceUpdates[0]).toMatchObject({ date: MOVED_TO, previousDate: BOOKED_FOR });
		expect(occurrenceUpdates[0].rescheduledAt).toBeInstanceOf(Date);

		expect(bookingUpdates).toHaveLength(1);
		expect(bookingUpdates[0]).toMatchObject({
			occurrenceId: 'o1',
			status: { in: ['PENDING', 'CONFIRMED'] },
			reminderSentAt: null,
		});
	});

	it('does nothing when the date is already the one asked for', async () => {
		const { service, occurrenceUpdates, bookingUpdates } = build();

		await service.reschedule('o1', { date: new Date(BOOKED_FOR) });

		expect(occurrenceUpdates).toHaveLength(0);
		expect(bookingUpdates).toHaveLength(0);
	});

	it('refuses to move a cancelled date', async () => {
		const { service, occurrenceUpdates } = build({ status: 'CANCELLED' });

		await expect(service.reschedule('o1', { date: MOVED_TO })).rejects.toMatchObject({
			code: 'OCCURRENCE_CANCELLED',
		});
		expect(occurrenceUpdates).toHaveLength(0);
	});

	it('refuses a date in the past', async () => {
		const { service, occurrenceUpdates } = build();

		await expect(
			service.reschedule('o1', { date: new Date('2020-01-01T09:00:00.000Z') }),
		).rejects.toMatchObject({ code: 'OCCURRENCE_IN_PAST' });
		expect(occurrenceUpdates).toHaveLength(0);
	});

	it('refuses when the event already has another date at that time', async () => {
		const { service, occurrenceUpdates } = build({ takenBy: 'o2' });

		await expect(service.reschedule('o1', { date: MOVED_TO })).rejects.toMatchObject({
			code: 'OCCURRENCE_DATE_TAKEN',
		});
		expect(occurrenceUpdates).toHaveLength(0);
	});

	it('refuses when the date changed under it, leaving the bookings alone', async () => {
		const { service, bookingUpdates } = build({ movedUnderUs: true });

		await expect(service.reschedule('o1', { date: MOVED_TO })).rejects.toMatchObject({
			code: 'OCCURRENCE_CHANGED_CONCURRENTLY',
		});
		expect(bookingUpdates).toHaveLength(0);
	});
});
