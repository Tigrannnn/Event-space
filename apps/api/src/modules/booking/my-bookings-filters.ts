import type { Prisma } from '@prisma/client';
import type { BookingDisplayStatus } from '@event-space/shared';

/** The columns a display status stands for — see BookingDisplayStatusEnum. */
export function bookingDisplayStatusWhere(status?: BookingDisplayStatus): Prisma.BookingWhereInput {
	switch (status) {
		case undefined:
			return {};
		case 'CHECKED_IN':
			return { status: 'CONFIRMED', checkedInAt: { not: null } };
		case 'CONFIRMED':
			return { status: 'CONFIRMED', checkedInAt: null };
		default:
			return { status };
	}
}

export type MyBookingsPhase = 'upcoming' | 'past';

export interface MyBookingsCursor {
	phase: MyBookingsPhase;
	boundary: Date;
	date: Date;
	id: string;
}

/**
 * Bookings that were attended or cancelled are history, newest tour first. Every other list
 * opens with the tours still ahead, nearest first, and continues into the ones already gone,
 * most recent first.
 */
export function myBookingsPhases(status?: BookingDisplayStatus): MyBookingsPhase[] {
	return status === 'CHECKED_IN' || status === 'CANCELLED' ? ['past'] : ['upcoming', 'past'];
}

export function myBookingsOrder(phase: MyBookingsPhase) {
	const direction = phase === 'upcoming' ? ('asc' as const) : ('desc' as const);

	return [{ occurrence: { date: direction } }, { id: direction }];
}

export function encodeMyBookingsCursor(cursor: MyBookingsCursor): string {
	return [cursor.phase, cursor.boundary.toISOString(), cursor.date.toISOString(), cursor.id].join(
		'|',
	);
}

/** A malformed cursor is treated as no cursor: the list restarts from the top. */
export function decodeMyBookingsCursor(cursor?: string): MyBookingsCursor | null {
	const [phase, boundary, date, id, ...rest] = cursor?.split('|') ?? [];

	if (rest.length > 0 || !id || (phase !== 'upcoming' && phase !== 'past')) return null;

	const boundaryDate = new Date(boundary);
	const tourDate = new Date(date);

	if (Number.isNaN(boundaryDate.getTime()) || Number.isNaN(tourDate.getTime())) return null;

	return { phase, boundary: boundaryDate, date: tourDate, id };
}

export function myBookingsWhere(params: {
	userId: string;
	status?: BookingDisplayStatus;
	phase?: MyBookingsPhase;
	boundary?: Date;
	after?: MyBookingsCursor | null;
}): Prisma.BookingWhereInput {
	const { phase, boundary, after } = params;
	const forward = phase === 'upcoming';
	const tourDate: Prisma.DateTimeFilter = {};

	if (phase && boundary && myBookingsPhases(params.status).length > 1) {
		if (forward) tourDate.gt = boundary;
		else tourDate.lte = boundary;
	}

	const where: Prisma.BookingWhereInput = {
		userId: params.userId,
		...bookingDisplayStatusWhere(params.status),
		...(Object.keys(tourDate).length > 0 ? { occurrence: { date: tourDate } } : {}),
	};

	if (!after) return where;

	const step = forward ? 'gt' : 'lt';

	return {
		...where,
		AND: [
			{
				OR: [
					{ occurrence: { date: { [step]: after.date } } },
					{ occurrence: { date: after.date }, id: { [step]: after.id } },
				],
			},
		],
	};
}
