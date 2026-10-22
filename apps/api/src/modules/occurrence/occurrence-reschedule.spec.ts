import { OccurrenceService } from './occurrence.service';

const MOVED_TO = new Date('2026-12-20T09:00:00.000Z');
const BOOKED_FOR = new Date('2026-12-10T09:00:00.000Z');

interface WorldOptions {
	status?: 'ACTIVE' | 'CANCELLED';
	takenBy?: string | null;
	movedUnderUs?: boolean;
	guests?: { email: string | null; name: string; locale: 'ru' | 'en' | 'hy' | null }[];
}

function build(options: WorldOptions = {}) {
	const {
		status = 'ACTIVE',
		takenBy = null,
		movedUnderUs = false,
		guests = [{ email: 'guest@example.com', name: 'Ара', locale: 'ru' as const }],
	} = options;

	const row = {
		id: 'o1',
		eventId: 'e1',
		date: BOOKED_FOR,
		status,
		previousDate: null as Date | null,
		rescheduledAt: null as Date | null,
		event: { translations: [{ locale: 'ru', title: 'Поход на Арагац' }] },
	};

	const occurrenceUpdates: Record<string, unknown>[] = [];
	const bookingUpdates: Record<string, unknown>[] = [];
	const letters: Record<string, unknown>[] = [];

	const eventOccurrence = {
		// Prisma hands back a fresh object every read; sharing one would let a later write
		// rewrite what the service already read.
		findUnique: () => Promise.resolve({ ...row }),
		findFirst: () => Promise.resolve(takenBy ? { id: takenBy } : null),
		findUniqueOrThrow: () => Promise.resolve({ ...row }),
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
			return Promise.resolve({ count: guests.length });
		},
		findMany: () => Promise.resolve(guests.map((user) => ({ brandHost: 'tours.example.com', user }))),
	};

	const prisma = {
		eventOccurrence,
		booking,
		$transaction: (run: (tx: unknown) => Promise<unknown>) => run({ eventOccurrence, booking }),
	};

	const mailService = {
		sendOccurrenceRescheduledEmail: (params: Record<string, unknown>) => {
			letters.push(params);
			return Promise.resolve();
		},
	};

	const service = new OccurrenceService(prisma as never, {} as never, mailService as never);

	return { service, row, occurrenceUpdates, bookingUpdates, letters };
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

	it('writes to everyone still holding a seat, in their own language', async () => {
		const { service, letters } = build({
			guests: [
				{ email: 'ara@example.com', name: 'Ара', locale: 'ru' },
				{ email: null, name: 'Без почты', locale: 'ru' },
				{ email: 'anna@example.com', name: 'Anna', locale: null },
			],
		});

		await service.reschedule('o1', {
			date: MOVED_TO,
			reasons: { ru: 'Перевал закрыт', en: 'The pass is closed' },
		});

		expect(letters).toHaveLength(2);
		expect(letters[0]).toMatchObject({
			email: 'ara@example.com',
			eventTitle: 'Поход на Арагац',
			previousDate: BOOKED_FOR,
			newDate: MOVED_TO,
			locale: 'ru',
			reason: 'Перевал закрыт',
		});
		expect(letters[1]).toMatchObject({ email: 'anna@example.com' });
	});

	it('sends no reason when the admin gave none', async () => {
		const { service, letters } = build();

		await service.reschedule('o1', { date: MOVED_TO });

		expect(letters).toHaveLength(1);
		expect(letters[0].reason).toBeUndefined();
	});

	it('does nothing when the date is already the one asked for', async () => {
		const { service, occurrenceUpdates, bookingUpdates } = build();

		await service.reschedule('o1', { date: new Date(BOOKED_FOR) });

		expect(occurrenceUpdates).toHaveLength(0);
		expect(bookingUpdates).toHaveLength(0);
	});

	it('refuses to move a cancelled date', async () => {
		const { service, occurrenceUpdates, letters } = build({ status: 'CANCELLED' });

		await expect(service.reschedule('o1', { date: MOVED_TO })).rejects.toMatchObject({
			code: 'OCCURRENCE_CANCELLED',
		});
		expect(occurrenceUpdates).toHaveLength(0);
		expect(letters).toHaveLength(0);
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
		const { service, bookingUpdates, letters } = build({ movedUnderUs: true });

		await expect(service.reschedule('o1', { date: MOVED_TO })).rejects.toMatchObject({
			code: 'OCCURRENCE_CHANGED_CONCURRENTLY',
		});
		expect(bookingUpdates).toHaveLength(0);
		expect(letters).toHaveLength(0);
	});
});
