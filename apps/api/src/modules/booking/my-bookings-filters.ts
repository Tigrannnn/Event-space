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

/**
 * Newest first, with the id as a tie-break.
 *
 * `createdAt` rather than `updatedAt`, which the list used to be sorted by: a cursor can only
 * walk a column that stands still. Paying for one booking rewrites its `updatedAt` and moves it
 * to the front, which would hand the next page a row the visitor has already seen — or skip one
 * entirely. The id makes the order total, so two bookings made in the same millisecond cannot
 * swap places between two requests.
 */
export const MY_BOOKINGS_ORDER = [{ createdAt: 'desc' as const }, { id: 'desc' as const }];

export interface BookingCursor {
	createdAt: Date;
	id: string;
}

export function encodeBookingCursor(booking: BookingCursor): string {
	return `${booking.createdAt.toISOString()}_${booking.id}`;
}

/** A malformed or truncated cursor is treated as no cursor: the list restarts from the top. */
export function decodeBookingCursor(cursor?: string): BookingCursor | null {
	if (!cursor) return null;

	// The id is a uuid and the timestamp an ISO string; neither holds an underscore, so the
	// last one separates them.
	const separator = cursor.lastIndexOf('_');
	if (separator <= 0) return null;

	const createdAt = new Date(cursor.slice(0, separator));
	const id = cursor.slice(separator + 1);

	return id && !Number.isNaN(createdAt.getTime()) ? { createdAt, id } : null;
}

/**
 * Everything on the page after the cursor, in MY_BOOKINGS_ORDER.
 *
 * The two-branch OR is what keyset pagination is: rows strictly older than the last one sent,
 * plus the rows sharing its timestamp that come after it by id.
 */
export function myBookingsWhere(params: {
	userId: string;
	status?: BookingDisplayStatus;
	cursor?: string;
}): Prisma.BookingWhereInput {
	const cursor = decodeBookingCursor(params.cursor);

	return {
		userId: params.userId,
		...bookingDisplayStatusWhere(params.status),
		...(cursor
			? {
					OR: [
						{ createdAt: { lt: cursor.createdAt } },
						{ createdAt: cursor.createdAt, id: { lt: cursor.id } },
					],
				}
			: {}),
	};
}
