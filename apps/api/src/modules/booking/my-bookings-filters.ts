import type { Prisma } from '@prisma/client';
import type { BookingDisplayStatus } from '@event-space/shared';
import { keysetAfter, KEYSET_ORDER } from '@shared';

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
 * Newest first by creation, not by `updatedAt`, which this list used to be sorted by: paying
 * for a booking rewrites `updatedAt` and moves it to the front, which would hand the next page
 * a row the visitor has already seen — or skip one entirely.
 */
export const MY_BOOKINGS_ORDER = KEYSET_ORDER;

export function myBookingsWhere(params: {
	userId: string;
	status?: BookingDisplayStatus;
	cursor?: string;
}): Prisma.BookingWhereInput {
	return {
		userId: params.userId,
		...bookingDisplayStatusWhere(params.status),
		...(keysetAfter(params.cursor) ?? {}),
	};
}
