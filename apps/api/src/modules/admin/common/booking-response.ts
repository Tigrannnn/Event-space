import type { BookingWithDetails } from '@event-space/shared';

type WithPrice = Record<string, unknown> & { price: unknown };

interface RawBooking extends Record<string, unknown> {
	amount: unknown;
	occurrence?: (Record<string, unknown> & { event?: WithPrice | null }) | null;
	adjustments?: (Record<string, unknown> & { amount: unknown })[] | null;
}

/** Prisma hands back Decimals; the API speaks plain numbers. */
export function normalizeBookingResponse(booking: RawBooking): BookingWithDetails {
	const event = booking.occurrence?.event
		? { ...booking.occurrence.event, price: Number(booking.occurrence.event.price) }
		: undefined;

	const occurrence = booking.occurrence
		? { ...booking.occurrence, event: event ?? undefined }
		: undefined;

	return {
		...booking,
		amount: Number(booking.amount),
		event,
		occurrence,
		adjustments: booking.adjustments?.map((a) => ({ ...a, amount: Number(a.amount) })) ?? [],
	} as unknown as BookingWithDetails;
}
